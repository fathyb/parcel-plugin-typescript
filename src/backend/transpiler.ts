import * as ts from 'typescript'

import {CompileResult} from '../interfaces'

import {PathTransform} from './transformers/paths'

export class Transpiler {
	private readonly compilerOptions: ts.CompilerOptions
	private readonly transformers: Array<ts.TransformerFactory<ts.SourceFile>> = []

	constructor({options}: ts.ParsedCommandLine, transformers: Array<ts.TransformerFactory<ts.SourceFile>> = []) {
		this.compilerOptions = options

		this.transformers.push(PathTransform(options), ...transformers)
	}

	public transpile(code: string, fileName: string): CompileResult {
		const {compilerOptions, transformers} = this
		const {outputText: js, sourceMapText: sourceMap} = ts.transpileModule(code, {
			compilerOptions, fileName,
			transformers: {
				before: transformers
			}
		})

		return {
			sources: {js, sourceMap}
		}
	}
}
