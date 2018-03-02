import * as ts from 'typescript'

import {CompileResult} from '../../interfaces'
import {Configuration, Transformers} from '../config-loader'
import {formatDiagnostics} from '../format'
import {CompilerHost} from './host'

// This should only be used for non-watch build
export class TypeScriptCompiler {
	private readonly program: ts.Program
	private readonly host: CompilerHost
	private readonly transformers: Transformers

	private firstRun = true

	constructor(
		{
			typescript: {fileNames, options},
			plugin: {transformers}
		}: Configuration
	) {
		const emitOptions = {
			...options,
			noEmitOnError: false
		}

		this.host = new CompilerHost(emitOptions)
		this.program = ts.createProgram(fileNames, emitOptions, this.host)
		this.transformers = transformers
	}

	public compile(path: string, reportErrors: boolean): CompileResult {
		const {program, transformers, host} = this
		const diagnostics: ts.Diagnostic[] = []

		if(this.firstRun) {
			this.firstRun = false

			diagnostics.push(...program.getOptionsDiagnostics())
		}

		const sourceFile = program.getSourceFile(path)

		if(!sourceFile) {
			throw new Error(`Cannot find source file "${path}"`)
		}

		const result = program.emit(sourceFile, undefined, undefined, false, transformers)

		diagnostics.push(
			...result.diagnostics,
			...program.getSemanticDiagnostics(sourceFile),
			...program.getSyntacticDiagnostics(sourceFile)
		)

		const formatted = formatDiagnostics(diagnostics, process.cwd())

		if(reportErrors && diagnostics.length > 0) {
			console.error(formatted)
		}

		const filePath = path.replace(/\.tsx?$/, '.js')
		const js = host.store.readFile(filePath)

		if(!js) {
			throw new Error(`Cannot find virtual file "${filePath}"`)
		}

		const sourceMap = host.store.readFile(filePath.replace(/\.js$/, '.js.map'))

		return {
			sources: {js, sourceMap},
			diagnostics: diagnostics.length > 0
				? formatted
				: null
		}
	}
}
