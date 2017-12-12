import * as ts from 'typescript'

// Find all nodes from the AST in the subtree of node of SyntaxKind kind.
export function collectDeepNodes<T extends ts.Node>(node: ts.Node, kind: ts.SyntaxKind): T[] {
	const nodes: T[] = []
	const helper = (child: ts.Node) => {
		if(child.kind === kind) {
			nodes.push(child as T)
		}

		ts.forEachChild(child, helper)
	}

	ts.forEachChild(node, helper)

	return nodes
}

export function getFirstNode(sourceFile: ts.SourceFile): ts.Node | null {
	if(sourceFile.statements.length > 0) {
		return sourceFile.statements[0] || null
	}

	return null
}

export function getLastNode(sourceFile: ts.SourceFile): ts.Node | null {
	if(sourceFile.statements.length > 0) {
		return sourceFile.statements[sourceFile.statements.length - 1] || null
	}

	return null
}
