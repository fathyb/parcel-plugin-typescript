import * as ts from 'typescript'

export class NodeEvaluationError extends Error {
	public start: number
	public end: number

	constructor(node: ts.Node) {
		super('Cannot evaluate node')

		this.start = node.pos
		this.end = node.end
	}
}

export function evaluateNode(node: ts.Node, scope: {[k: string]: any}): any {
	if(ts.isStringLiteral(node)) {
		return node.text
	}

	if(ts.isNumericLiteral(node)) {
		return parseInt(node.text, undefined)
	}

	if(ts.isIdentifier(node)) {
		return scope[node.text]
	}

	if(ts.isBinaryExpression(node)) {
		const {left, right} = node

		switch(node.operatorToken.kind) {
			case ts.SyntaxKind.PlusToken:
				return evaluateNode(left, scope) + evaluateNode(right, scope)
			case ts.SyntaxKind.MinusToken:
				return evaluateNode(left, scope) - evaluateNode(right, scope)
			default:
				throw new NodeEvaluationError(node)
		}
	}

	if(ts.isObjectLiteralExpression(node)) {
		const obj: any = {}

		node.properties.forEach(property => {
			let key: any|null = null

			if(!ts.isPropertyAssignment(property)) {
				throw new NodeEvaluationError(property)
			}

			const {initializer, name} = property

			if(ts.isComputedPropertyName(name)) {
				key = evaluateNode(name.expression, scope)
			}
			else if(ts.isIdentifier(name)) {
				key = name.text
			}
			else {
				throw new NodeEvaluationError(name)
			}

			obj[key] = evaluateNode(initializer, scope)
		})

		return obj
	}

	throw new NodeEvaluationError(node)
}
