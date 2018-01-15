import * as ts from 'typescript'

import {CompileResult} from '../../interfaces'
import {Configuration, Transformers} from '../configuration'
import {formatDiagnostics} from '../diagnostics'
import {Dependencies, getTransformers} from '../transformers'
import {CompilerHost} from './host'

// This should only be used for non-watch build
export class TypeScriptCompiler {
	private readonly dependencies: Dependencies = new Map()

	private readonly program: ts.Program
	private readonly host: CompilerHost
	private readonly transformers: Transformers

	private firstRun = true

	constructor(
		config: Configuration
	) {
		const emitOptions = {
			...config.typescript.options,
			noEmitOnError: false
		}

		this.host = new CompilerHost(emitOptions)
		this.program = ts.createProgram(config.typescript.fileNames, emitOptions, this.host)
		this.transformers = getTransformers(config, this.dependencies, this.host)
	}

	public compile(path: string, reportErrors: boolean, root: string): CompileResult {
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

		const formatted = formatDiagnostics(diagnostics, root)

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
			dependencies: this.dependencies.get(path) || [],
			sources: {js, sourceMap},
			diagnostics: diagnostics.length > 0
				? formatted
				: null
		}
	}
}
