import * as ts from 'typescript'

import {TranspileResult} from '../interfaces'

export class Transpiler {
	private readonly compilerOptions: ts.CompilerOptions

	constructor(options: ts.ParsedCommandLine) {
		this.compilerOptions = options.options
	}

	public transpile(code: string, fileName: string): TranspileResult {
		const {compilerOptions} = this
		const {outputText: js, sourceMapText: sourceMap} = ts.transpileModule(code, {compilerOptions, fileName})

		return {
			sources: {js, sourceMap}
		}
	}
}
