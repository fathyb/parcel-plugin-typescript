import * as ts from 'typescript'

import {TranspilationResult} from '../interfaces'

export class Transpiler {
	private readonly compilerOptions: ts.CompilerOptions

	constructor(json: any) {
		const {options} = ts.parseJsonConfigFileContent(json, ts.sys, process.cwd())

		this.compilerOptions = options
	}

	public parse(code: string, fileName: string): TranspilationResult {
		const {compilerOptions} = this
		const {outputText} = ts.transpileModule(code, {compilerOptions, fileName})

		return {
			sources: {
				js: outputText
			}
		}
	}
}
