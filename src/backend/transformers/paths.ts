import * as path from 'path'
import * as ts from 'typescript'

import {findModule} from '../modules/resolver'

// TODO: use options from the TransformationContext
export function PathTransform(options: ts.CompilerOptions): ts.TransformerFactory<ts.SourceFile> {
	return function(context: ts.TransformationContext) {
		return (node: ts.SourceFile) => {
			if(options.baseUrl) {
				ts.visitEachChild(node, child => {
					if(ts.isImportDeclaration(child)) {
						const specifier = child.moduleSpecifier

						if(!ts.isStringLiteral(specifier)) {
							throw new Error('Expected child.moduleSpecifier to be StringLiteral')
						}

						let resolved = resolve(specifier.text, options)

						if(/^\//.test(resolved)) {
							const sourceDir = path.dirname(node.fileName)

							resolved = path.relative(sourceDir, resolved)

							if(!/^\./.test(resolved)) {
								resolved = `./${resolved}`
							}
						}

						child.moduleSpecifier = ts.createLiteral(resolved)

						return child
					}

					return undefined
				}, context)
			}

			return node
		}
	}
}

function resolve(modulePath: string, {paths, baseUrl}: ts.CompilerOptions): string {
	if(!baseUrl) {
		return modulePath
	}

	let resolved = findModule(path.resolve(baseUrl, modulePath))

	if(resolved) {
		return resolved
	}

	if(paths) {
		const mappings = Object
			.keys(paths)
			.map(alias => getPathMappings(alias, paths[alias], baseUrl))
			.reduce((a, b) => a.concat(b), [])
			.filter(mapping => mapping.pattern.test(modulePath))

		for(const mapping of mappings) {
			const local = modulePath.match(mapping.pattern)![1]

			resolved = findModule(mapping.target.replace(/\*/, local))

			if(resolved !== null) {
				return resolved
			}
		}
	}

	return modulePath
}

interface PathMapping {
	pattern: RegExp
	moduleOnly: boolean
	alias: string
	target: string
}

function getPathMappings(alias: string, targets: string[], baseUrl: string = '.'): PathMapping[] {
	const absoluteBase = path.resolve(process.cwd(), baseUrl)

	const moduleOnly = alias.indexOf('*') === -1
	const escaped = escapeRegExp(alias)

	return targets.map(relativeTarget => {
		const target = path.resolve(absoluteBase, relativeTarget)
		let pattern: RegExp

		if(moduleOnly) {
			pattern = new RegExp(`^${escaped}$`)
		}
		else {
			const withStarCapturing = escaped.replace('\\*', '(.*)')

			pattern = new RegExp(`^${withStarCapturing}`)
		}

		return {
			moduleOnly, alias, pattern, target
		}
	})
}

function escapeRegExp(str: string) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
}
