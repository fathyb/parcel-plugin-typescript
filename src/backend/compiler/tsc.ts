import * as ts from 'typescript'

import {CompileResult} from '../../interfaces'
import {formatDiagnostics} from '../format'
import {PathTransform} from '../transformers/paths'
import {CompilerHost} from './host'

// This should only be used for non-watch build
export class TypeScriptCompiler {
	private readonly program: ts.Program
	private readonly host: CompilerHost
	private readonly transformers: Array<ts.TransformerFactory<ts.SourceFile>>

	private firstRun = true

	constructor({fileNames, options}: ts.ParsedCommandLine) {
		this.host = new CompilerHost(options)
		this.program = ts.createProgram(fileNames, options, this.host)
		this.transformers = [PathTransform(options)]
	}

	public compile(path: string, reportErrors: boolean): CompileResult {
		const {program, transformers: before} = this
		const diagnostics: ts.Diagnostic[] = []

		if(this.firstRun) {
			this.firstRun = false

			diagnostics.push(...program.getOptionsDiagnostics())
		}

		const sourceFile = program.getSourceFile(path)

		if(!sourceFile) {
			throw new Error(`Cannot find source file "${path}"`)
		}

		const result = program.emit(sourceFile, undefined, undefined, false, {before})

		diagnostics.push(
			...result.diagnostics,
			...program.getSemanticDiagnostics(sourceFile),
			...program.getSyntacticDiagnostics(sourceFile)
		)

		const formatted = formatDiagnostics(diagnostics, process.cwd())

		if(reportErrors && diagnostics.length > 0) {
			console.error(formatted)
		}

		const js = this.host.store.readFile(path.replace(/\.tsx?$/, '.js'))

		if(!js) {
			throw new Error(`Cannot find virtual file "${path}"`)
		}

		return {
			sources: {js},
			diagnostics: diagnostics.length > 0
				? formatted
				: null
		}
	}
}
