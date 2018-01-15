import * as ts from 'typescript'

import {ReplacerOptions} from '.'

export function replaceProcessEnv({node}: ReplacerOptions) {
	if(!ts.isPropertyAccessExpression(node)) {
		return
	}

	const {expression: processEnv} = node

	if(
		ts.isPropertyAccessExpression(processEnv) && ts.isIdentifier(processEnv.expression) &&
		processEnv.expression.text === 'process' && processEnv.name.text === 'env'
	) {
		const value = process.env[node.name.text]

		if(typeof value === 'string') {
			return ts.createLiteral(value)
		}
		else {
			return ts.createIdentifier('undefined')
		}
	}
}
