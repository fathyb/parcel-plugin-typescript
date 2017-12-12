import * as ts from 'typescript'

import {TranspileResult} from '../interfaces'

import {replaceResources} from './transformers/angular/resources'
import {PathTransform} from './transformers/paths'

export class Transpiler {
	private readonly compilerOptions: ts.CompilerOptions
	private readonly transformers: Array<ts.TransformerFactory<ts.SourceFile>> = [
		replaceResources(() => true)
	]

	constructor({options}: ts.ParsedCommandLine) {
		this.compilerOptions = options
		this.transformers.push(PathTransform(options))
	}

	public transpile(code: string, fileName: string): TranspileResult {
		const {compilerOptions, transformers: before} = this
		const {outputText: js, sourceMapText: sourceMap} = ts.transpileModule(code, {
			compilerOptions, fileName,
			transformers: {
				before
			}
		})

		return {
			sources: {js, sourceMap}
		}
	}
}
