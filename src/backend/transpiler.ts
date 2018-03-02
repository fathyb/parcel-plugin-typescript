import * as ts from 'typescript'

import {CompileResult} from '../interfaces'
import {Configuration, Transformers} from './config-loader'

export class Transpiler {
	private readonly compilerOptions: ts.CompilerOptions
	private readonly transformers: Transformers

	constructor(
		{
			typescript: {options},
			plugin: {transformers}
		}: Configuration
	) {
		this.compilerOptions = options
		this.transformers = transformers
	}

	public transpile(code: string, fileName: string): CompileResult {
		const {compilerOptions, transformers} = this
		const {outputText: js, sourceMapText: sourceMap} = ts.transpileModule(code, {
			compilerOptions, fileName, transformers
		})

		return {
			sources: {js, sourceMap},
			diagnostics: null
		}
	}
}
