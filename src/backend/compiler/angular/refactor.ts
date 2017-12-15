import * as path from 'path'
import * as ts from 'typescript'

import {SourceMapConsumer, SourceMapGenerator} from 'source-map'

import MagicString from 'magic-string'

/**
 * Find all nodes from the AST in the subtree of node of SyntaxKind kind.
 * @param node The root node to check, or null if the whole tree should be searched.
 * @param sourceFile The source file where the node is.
 * @param kind The kind of nodes to find.
 * @param recursive Whether to go in matched nodes to keep matching.
 * @param max The maximum number of items to return.
 * @return all nodes of kind, or [] if none is found
 */
// TODO: replace this with collectDeepNodes and add limits to collectDeepNodes
export function findAstNodes<T extends ts.Node>(
	node: ts.Node | null,
	sourceFile: ts.SourceFile,
	kind: ts.SyntaxKind,
	recursive = false,
	max = Infinity
): T[] {
	// TODO: refactor operations that only need `refactor.findAstNodes()` to use this instead.
	if(max === 0) {
		return []
	}
	if(!node) {
		node = sourceFile
	}

	const arr: T[] = []

	if(node.kind === kind) {
		// If we're not recursively looking for children, stop here.
		if(!recursive) {
			return [node as T]
		}

		arr.push(node as T)
		max--
	}

	if(max > 0) {
		for(const child of node.getChildren(sourceFile)) {
			findAstNodes(child, sourceFile, kind, recursive, max).forEach((astNode: ts.Node) => {
				if(max > 0) {
					arr.push(astNode as T)
				}
				max--
			})

			if(max <= 0) {
				break
			}
		}
	}
	return arr
}

export interface TranspileOutput {
	outputText: string
	sourceMap: any | null
}

function resolve(filePath: string, program: ts.Program) {
	if(path.isAbsolute(filePath)) {
		return filePath
	}

	const compilerOptions = program.getCompilerOptions()
	const basePath = compilerOptions.baseUrl || compilerOptions.rootDir

	if(!basePath) {
		throw new Error(`Trying to resolve '${filePath}' without a basePath.`)
	}

	return path.join(basePath, filePath)
}

export class TypeScriptFileRefactor {
	public fileName: string
	public sourceFile: ts.SourceFile
	private sourceString: any
	private sourceText: string
	private changed = false

	constructor(fileName: string, host: ts.CompilerHost, private program?: ts.Program, source?: string | null) {
		fileName = resolve(fileName, program!).replace(/\\/g, '/')
		this.fileName = fileName

		if(program) {
			if(source) {
				this.sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true)
			}
			else {
				this.sourceFile = program.getSourceFile(fileName)
			}
		}
		if(!this.sourceFile) {
			this.sourceFile = ts.createSourceFile(
				fileName, source || host.readFile(fileName)!, ts.ScriptTarget.Latest, true
			)
		}

		this.sourceText = this.sourceFile.getFullText(this.sourceFile)
		this.sourceString = new MagicString(this.sourceText)
	}

	/**
	 * Collates the diagnostic messages for the current source file
	 */
	public getDiagnostics(typeCheck = true): ts.Diagnostic[] {
		if(!this.program) {
			return []
		}
		let diagnostics: ts.Diagnostic[] = []
		// only concat the declaration diagnostics if the tsconfig config sets it to true.
		if(this.program.getCompilerOptions().declaration === true) {
			diagnostics = diagnostics.concat(this.program.getDeclarationDiagnostics(this.sourceFile))
		}
		diagnostics = diagnostics.concat(
			this.program.getSyntacticDiagnostics(this.sourceFile),
			typeCheck ? this.program.getSemanticDiagnostics(this.sourceFile) : [])

		return diagnostics
	}

	/**
	 * Find all nodes from the AST in the subtree of node of SyntaxKind kind.
	 * @param node The root node to check, or null if the whole tree should be searched.
	 * @param kind The kind of nodes to find.
	 * @param recursive Whether to go in matched nodes to keep matching.
	 * @param max The maximum number of items to return.
	 * @return all nodes of kind, or [] if none is found
	 */
	public findAstNodes(node: ts.Node | null, kind: ts.SyntaxKind, recursive = false, max = Infinity): ts.Node[] {
		return findAstNodes(node, this.sourceFile, kind, recursive, max)
	}

	public findFirstAstNode(node: ts.Node | null, kind: ts.SyntaxKind): ts.Node | null {
		return this.findAstNodes(node, kind, false, 1)[0] || null
	}

	public appendAfter(node: ts.Node, text: string): void {
		this.sourceString.appendRight(node.getEnd(), text)
	}
	public append(node: ts.Node, text: string): void {
		this.sourceString.appendLeft(node.getEnd(), text)
	}

	public prependBefore(node: ts.Node, text: string) {
		this.sourceString.appendLeft(node.getStart(), text)
	}

	public insertImport(symbolName: string, modulePath: string): void {
		// Find all imports.
		const allImports = this.findAstNodes(this.sourceFile, ts.SyntaxKind.ImportDeclaration)
		const maybeImports = (allImports as ts.ImportDeclaration[])
			.filter(node =>
				// Filter all imports that do not match the modulePath.
				node.moduleSpecifier.kind === ts.SyntaxKind.StringLiteral &&
				(node.moduleSpecifier as ts.StringLiteral).text === modulePath
			)
			.filter(node => {
				// Remove import statements that are either `import 'XYZ'` or `import * as X from 'XYZ'`.
				const clause = node.importClause as ts.ImportClause

				if(!clause || clause.name || !clause.namedBindings) {
					return false
				}

				return clause.namedBindings.kind === ts.SyntaxKind.NamedImports
			})
			.map(node =>
				// Return the `{ ... }` list of the named import.
				(node.importClause as ts.ImportClause).namedBindings as ts.NamedImports
			)

		if(maybeImports.length) {
			// There's an `import {A, B, C} from 'modulePath'`.
			// Find if it's in either imports. If so, just return nothing to do.
			const hasImportAlready = maybeImports.some((node: ts.NamedImports) =>
				node.elements.some((element: ts.ImportSpecifier) => element.name.text === symbolName)
			)

			if(hasImportAlready) {
				return
			}

			// Just pick the first one and insert at the end of its identifier list.
			this.appendAfter(maybeImports[0].elements[maybeImports[0].elements.length - 1], `, ${symbolName}`)
		}
		else {
			// Find the last import and insert after.
			this.appendAfter(allImports[allImports.length - 1], `import {${symbolName}} from '${modulePath}'`)
		}
	}

	public removeNode(node: ts.Node) {
		this.sourceString.remove(node.getStart(this.sourceFile), node.getEnd())
		this.changed = true
	}

	public removeNodes(...nodes: Array<ts.Node | null>) {
		nodes.forEach(node => node && this.removeNode(node))
	}

	public replaceNode(node: ts.Node, replacement: string) {
		const replaceSymbolName: boolean = node.kind === ts.SyntaxKind.Identifier

		this.sourceString.overwrite(
			node.getStart(this.sourceFile), node.getEnd(), replacement, {storeName: replaceSymbolName}
		)
		this.changed = true
	}

	public sourceMatch(re: RegExp) {
		return this.sourceText.match(re) !== null
	}

	public transpile(compilerOptions: ts.CompilerOptions): TranspileOutput {
		const source = this.sourceText
		const result = ts.transpileModule(source, {
			compilerOptions: Object.assign({}, compilerOptions, {
				sourceMap: true,
				inlineSources: false,
				inlineSourceMap: false,
				sourceRoot: ''
			}),
			fileName: this.fileName
		})

		if(result.sourceMapText) {
			const sourceMapJson = JSON.parse(result.sourceMapText)
			const consumer = new SourceMapConsumer(sourceMapJson)
			const map = SourceMapGenerator.fromSourceMap(consumer)

			sourceMapJson.sources = [this.fileName]

			if(this.changed) {
				const generated = this.sourceString.generateMap({
					file: path.basename(this.fileName.replace(/\.ts$/, '.js')),
					source: this.fileName,
					hires: true,
				})

				map.applySourceMap(new SourceMapConsumer(generated), this.fileName)
			}

			const sourceMap = (map as any).toJSON()
			const fileName = process.platform.startsWith('win')
				? this.fileName.replace(/\//g, '\\')
				: this.fileName
			sourceMap.sources = [fileName]
			sourceMap.file = path.basename(fileName, '.ts') + '.js'
			sourceMap.sourcesContent = [this.sourceText]

			return { outputText: result.outputText, sourceMap }
		}
		else {
			return {
				outputText: result.outputText,
				sourceMap: null
			}
		}
	}
}
