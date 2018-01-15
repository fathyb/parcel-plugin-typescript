import * as ts from 'typescript'

import {traverse} from '../../ast-utils/traverse'
import {ImportDependency} from '../paths'
import {replaceFsRead, replaceGlobals, replaceProcessEnv, ReplacerOptions} from './replacers'
import {VARS} from './vars'

const REPLACERS = {
	processEnv: {
		test: source => /(process)|(env)/.test(source),
		replacer: replaceProcessEnv
	},
	globals: {
		test: source => /(process)|(global)|(Buffer)|(__dirname)|(__filename)/.test(source),
		replacer: replaceGlobals
	},
	fs: {
		test: (source, dependencies) => dependencies.has('fs') || /readFileSync/.test(source),
		replacer: replaceFsRead
	}
} as {
	[key: string]: {
		test: (source: string, dependencies: Map<string, any>) => boolean
		replacer: (opts: ReplacerOptions) => ts.Node | undefined | void
	}
}

export const ParcelTransform = (
	dependencies: Map<string, ImportDependency[]>
): ts.TransformerFactory<ts.SourceFile> =>
	(context: ts.TransformationContext) =>
		(source: ts.SourceFile) => {
			const {fileName} = source
			const globals = new Map<string, ts.VariableDeclaration>()
			const deps = {
				add(moduleName: string, position = 0) {
					const fileDeps = dependencies.get(fileName)
					const dep = {source: moduleName, position}

					if(fileDeps) {
						fileDeps.push(dep)
					}
					else {
						dependencies.set(fileName, [dep])
					}
				}
			}

			function addGlobal(name: string) {
				if(!globals.has(name)) {
					globals.set(name, VARS[name](fileName, deps))
				}
			}

			let sourceDeps = dependencies.get(source.fileName)

			if(!sourceDeps) {
				dependencies.set(source.fileName, sourceDeps = [])
			}

			const replacers = Object
				.keys(REPLACERS)
				.map(key => REPLACERS[key as keyof typeof REPLACERS])
				.filter(({test}) => test(source.text, dependencies))
				.map(({replacer}) => replacer)

			const {length} = replacers

			return ts.visitNode(source, rootNode => {
				const finalSource = traverse(rootNode, (node, scope) => {
					const options = {addGlobal, fileName, globals, node, scope}

					for(let i = 0; i < length; i++) {
						const replaced = replacers[i](options)

						if(replaced) {
							return replaced
						}
					}

					return node
				}, context, sourceDeps!) as ts.SourceFile

				return ts.updateSourceFileNode(
					finalSource,
					globals.size
						? [
							ts.createVariableStatement(
								undefined,
								Array.from(globals.values())
							),
							...finalSource.statements
						]
						: finalSource.statements
				)
			})
		}
