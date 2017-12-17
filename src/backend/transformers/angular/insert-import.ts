import * as ts from 'typescript'

import {collectDeepNodes, getFirstNode} from './ast-helpers'
import {AddNodeOperation, TransformOperation} from './interfaces'

export function insertStarImport(
	sourceFile: ts.SourceFile,
	identifier: ts.Identifier,
	modulePath: string,
	target?: ts.Node,
	before = false,
): TransformOperation[] {
	const ops: TransformOperation[] = []
	const allImports = collectDeepNodes(sourceFile, ts.SyntaxKind.ImportDeclaration)

	// We don't need to verify if the symbol is already imported, star imports should be unique.

	// Create the new import node.
	const namespaceImport = ts.createNamespaceImport(identifier)
	const importClause = ts.createImportClause(undefined, namespaceImport)
	const newImport = ts.createImportDeclaration(undefined, undefined, importClause,
		ts.createLiteral(modulePath))

	if(target) {
		ops.push(new AddNodeOperation(
			sourceFile,
			target,
			before ? newImport : undefined,
			before ? undefined : newImport
		))
	}
	else if(allImports.length > 0) {
		// Find the last import and insert after.
		ops.push(new AddNodeOperation(
			sourceFile,
			allImports[allImports.length - 1],
			undefined,
			newImport
		))
	}
	else {
		const node = getFirstNode(sourceFile)

		if(node) {
			// Insert before the first node.
			ops.push(new AddNodeOperation(sourceFile, node, newImport))

		}
	}

	return ops
}

export function insertImport(
	sourceFile: ts.SourceFile,
	symbolName: string,
	modulePath: string
): TransformOperation[] {
	const ops: TransformOperation[] = []
	// Find all imports.
	const allImports = collectDeepNodes(sourceFile, ts.SyntaxKind.ImportDeclaration)
	const maybeImports = (allImports as ts.ImportDeclaration[])
		.filter(node => {
			// Filter all imports that do not match the modulePath.
			return (
				node.kind === ts.SyntaxKind.ImportDeclaration &&
				node.moduleSpecifier.kind === ts.SyntaxKind.StringLiteral &&
				(node.moduleSpecifier as ts.StringLiteral).text === modulePath
			)
		})
		.filter(node => {
			// Filter out import statements that are either `import 'XYZ'` or `import * as X from 'XYZ'`.
			const clause = node.importClause as ts.ImportClause

			if(!clause || clause.name || !clause.namedBindings) {
				return false
			}

			return clause.namedBindings.kind === ts.SyntaxKind.NamedImports
		})
		.map(node => {
			// Return the `{ ... }` list of the named import.
			return (node.importClause as ts.ImportClause).namedBindings as ts.NamedImports
		})

	if(maybeImports.length) {
		// There's an `import {A, B, C} from 'modulePath'`.
		// Find if it's in either imports. If so, just return nothing to do.
		const hasImportAlready = maybeImports.some(node =>
			node.elements.some(element => element.name.text === symbolName)
		)

		if(hasImportAlready) {
			return ops
		}

		// Just pick the first one and insert at the end of its identifier list.
		ops.push(new AddNodeOperation(
			sourceFile,
			maybeImports[0].elements[maybeImports[0].elements.length - 1],
			undefined,
			ts.createImportSpecifier(undefined, ts.createIdentifier(symbolName))
		))
	} else {
		// Create the new import node.
		const namedImports = ts.createNamedImports([ts.createImportSpecifier(undefined, ts.createIdentifier(symbolName))])
		const importClause = ts.createImportClause(undefined, namedImports)
		const newImport = ts.createImportDeclaration(undefined, undefined, importClause, ts.createLiteral(modulePath))

		if(allImports.length > 0) {
			// Find the last import and insert after.
			ops.push(new AddNodeOperation(
				sourceFile,
				allImports[allImports.length - 1],
				undefined,
				newImport
			))
		}
		else {
			const node = getFirstNode(sourceFile)

			if(node) {
				// Insert before the first node.
				ops.push(new AddNodeOperation(sourceFile, node, newImport))
			}
		}
	}

	return ops
}
