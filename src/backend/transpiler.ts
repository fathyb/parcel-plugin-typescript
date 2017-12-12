import * as ts from 'typescript'

import {TranspileResult} from '../interfaces'

import {replaceResources} from './transformers/angular/resources'
import {PathTransform} from './transformers/paths'

export class Transpiler {
	private readonly compilerOptions: ts.CompilerOptions
	private readonly transformers: Array<ts.TransformerFactory<ts.SourceFile>> = []

	constructor({options}: ts.ParsedCommandLine) {
		this.compilerOptions = options
		this.transformers.push(PathTransform(options))
	}

	public transpile(code: string, fileName: string, forPlatform: 'angular'|'other'): TranspileResult {
		const {compilerOptions, transformers} = this
		const {outputText: js, sourceMapText: sourceMap} = ts.transpileModule(code, {
			compilerOptions, fileName,
			transformers: {
				before: [...transformers, ...(forPlatform === 'angular' ? [replaceResources(() => true)] : [])]
			}
		})

		return {
			sources: {js, sourceMap}
		}
	}
}
