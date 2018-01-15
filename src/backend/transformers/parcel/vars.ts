import * as ts from 'typescript'

import {dirname} from 'path'

export interface Dependencies {
	add(dep: string): void
}

function createVariable(name: string, val: ts.Expression) {
	return ts.createVariableDeclaration(name, ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword), val)
}

const vars = {
	__dirname: (name: string): ts.VariableDeclaration =>
		// var __dirname = ${dirname}
		createVariable(
			'__dirname',
			ts.createLiteral(dirname(name))
		),
	__filename: (name: string): ts.VariableDeclaration =>
		// var __filename = ${filename}
		createVariable(
			'__filename',
			ts.createLiteral(name)
		),
	global: (): ts.VariableDeclaration =>
		// var global = (1, eval)('this')
		createVariable(
			'global',
			ts.createCall(
				ts.createParen(
					ts.createBinary(
						ts.createNumericLiteral('1'),
						ts.SyntaxKind.CommaToken,
						ts.createIdentifier('eval')
					)
				),
				undefined,
				[ts.createLiteral('this')]
			)
		),
	process: (_: string, dependencies: Dependencies): ts.VariableDeclaration => {
		dependencies.add('process')

		// var process = require('process')
		return createVariable(
			'process',
			ts.createCall(
				ts.createIdentifier('require'),
				undefined,
				[ts.createLiteral('process')]
			)
		)
	},
	Buffer: (_: string, dependencies: Dependencies): ts.VariableDeclaration => {
		dependencies.add('buffer')

		// var Buffer = require('buffer').Buffer
		return createVariable(
			'Buffer',
			ts.createPropertyAccess(
				ts.createCall(
					ts.createIdentifier('require'),
					undefined,
					[ts.createLiteral('buffer')]
				),
				ts.createIdentifier('Buffer')
			)
		)
	}
}

export const VARS = vars as typeof vars & {
	[k: string]: (
		name: string,
		dependencies: {
			add(dep: string): void
		}
	) => ts.VariableDeclaration
}
