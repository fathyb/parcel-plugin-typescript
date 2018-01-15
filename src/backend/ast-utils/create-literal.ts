import * as ts from 'typescript'

export function createLiteral(value: any) {
	if(typeof value === 'number') {
		return ts.createNumericLiteral(value.toString(10))
	}

	if(typeof value === 'string') {
		return ts.createLiteral(value)
	}

	throw new Error('node not supported')
}
