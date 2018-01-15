import * as ts from 'typescript'

import {CompileResult} from '../interfaces'
import {Configuration, Transformers} from './configuration'
import {Dependencies, getTransformers} from './transformers'

export class Transpiler {
	private readonly dependencies: Dependencies = new Map()

	private readonly transformers: Transformers
	private readonly useTypeScriptAST: boolean
	private readonly compilerOptions: ts.CompilerOptions

	constructor(
		config: Configuration
	) {
		this.compilerOptions = config.typescript.options

		this.useTypeScriptAST = config.plugin.useTypeScriptAST
		this.transformers = getTransformers(config, this.dependencies)
	}

	public transpile(code: string, fileName: string): CompileResult {
		const {compilerOptions, transformers, useTypeScriptAST} = this
		const {outputText: js, sourceMapText: sourceMap} = ts.transpileModule(code, {
			fileName,
			transformers,
			compilerOptions: {
				...compilerOptions,
				esModuleInterop: useTypeScriptAST
					? true
					: compilerOptions.esModuleInterop,
				module: useTypeScriptAST
					? ts.ModuleKind.CommonJS
					: compilerOptions.module
			}
		})

		return {
			dependencies: this.dependencies.get(fileName) || [],
			sources: {js, sourceMap},
			diagnostics: null
		}
	}
}
