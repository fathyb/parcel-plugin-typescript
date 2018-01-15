import * as ts from 'typescript'

import {resolve} from '../modules/resolver'

export interface ImportDependency {
	source: string
	position: number
}

export const PathTransform = (
	rootDir: string,
	options: ts.CompilerOptions,
	host: ts.ModuleResolutionHost,
	dependencies?: Map<string, ImportDependency[]>|null
): ts.TransformerFactory<ts.SourceFile> =>
	(context: ts.TransformationContext) =>
		(source: ts.SourceFile) => {
			if(!options.baseUrl && !dependencies) {
				return source
			}

			return ts.visitNode(source, rootNode =>
				ts.visitEachChild(rootNode, node => {
					if(!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) {
						return node
					}

					const specifier = node.moduleSpecifier

					if(!specifier || !ts.isStringLiteral(specifier)) {
						return node
					}

					const resolved = resolve(source.fileName, specifier.text, rootDir, options, host)

					if(dependencies) {
						const deps = dependencies.get(source.fileName)
						const dep = {
							source: resolved,
							position: specifier.pos
						}

						if(deps) {
							deps.push(dep)
						}
						else {
							dependencies.set(source.fileName, [dep])
						}
					}

					if((dependencies || options.baseUrl) && resolved !== specifier.text) {
						const {decorators, modifiers} = node
						const literal = ts.createLiteral(resolved)

						if(ts.isExportDeclaration(node)) {
							return ts.updateExportDeclaration(node, decorators, modifiers, node.exportClause, literal)
						}
						else {
							return ts.updateImportDeclaration(node, decorators, modifiers, node.importClause, literal)
						}
					}

					return node
				}, context)
			)
		}
