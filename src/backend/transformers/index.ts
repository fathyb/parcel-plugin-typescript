import * as ts from 'typescript'

import {CompilerHost} from '../compiler/host'
import {Configuration} from '../configuration'
import {ParcelTransform} from './parcel'
import {ImportDependency, PathTransform} from './paths'

export type Dependencies = Map<string, ImportDependency[]>

export function getTransformers(
	{
		rootDir,
		typescript: {options},
		plugin: {
			transformers: {before, after},
			useTypeScriptAST
		}
	}: Configuration,
	dependencies: Dependencies,
	host: ts.CompilerHost = new CompilerHost(options)
) {
	return {
		after,
		before: [
			...before,
			PathTransform(rootDir, options, host, dependencies),
			...(
				useTypeScriptAST
					? [ParcelTransform(dependencies)]
					: []
			)
		]
	}
}
