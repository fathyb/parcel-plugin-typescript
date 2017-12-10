import * as ts from 'typescript'

import {TranspilationResult} from '../interfaces'

export class Transpiler {
	private readonly compilerOptions: ts.CompilerOptions

	constructor(options: ts.ParsedCommandLine) {
		this.compilerOptions = options.options
	}

	public transpile(code: string, fileName: string): TranspilationResult {
		const {compilerOptions} = this
		const {outputText} = ts.transpileModule(code, {compilerOptions, fileName})

		return {
			sources: {
				js: outputText
			}
		}
	}
}
