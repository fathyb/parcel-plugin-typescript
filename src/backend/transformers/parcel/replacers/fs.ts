import {readFileSync} from 'fs'
import {dirname} from 'path'
import * as ts from 'typescript'

import {evaluateNode} from '../../../ast-utils/eval'
import {astTemplate} from '../../../ast-utils/template'

import {ReplacerOptions} from '.'

const BufferTemplate = astTemplate<ts.ExpressionStatement>('new Buffer(BASE64, "base64")')

function evalNode(
	node: ts.CallExpression, fileName: string,
	addGlobal: (name: string) => void
) {
	const localScope = {
		__dirname: dirname(fileName),
		__filename: fileName
	}
	const [file, ...args] = node.arguments.map(arg => evaluateNode(arg, localScope))
	const result = readFileSync(file, ...args)

	if(Buffer.isBuffer(result)) {
		addGlobal('Buffer')

		return BufferTemplate({
			BASE64: result.toString('base64')
		}).expression
	}
	else if(typeof result === 'string') {
		return ts.createLiteral(result)
	}

	throw new Error('fs.readFileSync result type is not supported')
}

export function replaceFsRead(
	{fileName, node, scope, addGlobal}: ReplacerOptions
): ts.VisitResult<ts.Node> | undefined {
	if(!ts.isCallExpression(node)) {
		return
	}

	const {expression} = node

	if(ts.isPropertyAccessExpression(expression)) {
		const {expression: propExpr, name} = expression
		const required = scope.getRequiredModule(propExpr)
		const nameIsReadMethod = ts.isIdentifier(name) && name.text === 'readFileSync'

		if(required === 'fs' && nameIsReadMethod) {
			return evalNode(node, fileName, addGlobal)
		}

		if(ts.isIdentifier(propExpr) && nameIsReadMethod) {
			const exprVar = scope.get(propExpr.text)

			if(exprVar && exprVar.type === 'import' && exprVar.from === 'fs' && !exprVar.name) {
				return evalNode(node, fileName, addGlobal)
			}
		}
	}
	else if(ts.isIdentifier(expression)) {
		const exprVar = scope.get(expression.text)

		if(exprVar && exprVar.type === 'import' && exprVar.from === 'fs' && exprVar.name === 'readFileSync') {
			return evalNode(node, fileName, addGlobal)
		}
	}
}
