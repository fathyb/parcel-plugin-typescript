import * as ts from 'typescript'

import {TranspileResult} from '../interfaces'
import {replaceResources} from './angular'

export class Transpiler {
	private readonly compilerOptions: ts.CompilerOptions
	private readonly transformers = [replaceResources(() => true)]

	constructor(options: ts.ParsedCommandLine) {
		this.compilerOptions = options.options
	}

	public transpile(code: string, fileName: string): TranspileResult {
		const {compilerOptions, transformers: before} = this
		const {outputText: js, sourceMapText: sourceMap} = ts.transpileModule(code, {
			compilerOptions, fileName,
			transformers: {before}
		})

		if(/app.component/.test(fileName)) {
			console.log('\n\nResult %s\n\n', js)
		}

		return {
			sources: {js, sourceMap}
		}
	}
}
