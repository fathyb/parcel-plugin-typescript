import * as ts from 'typescript'

import {createLiteral} from './create-literal'

export interface Vars {
	[key: string]: any
}

export function astTemplate<T extends (ts.Statement | ReadonlyArray<ts.Statement>)>(
	text: string
): (vars: Vars) => T {
	const source = ts.createSourceFile('template.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
	const transformers = (vars: Vars) => [(context: ts.TransformationContext) =>
		(root: ts.SourceFile) => {
			function visit(node: ts.Node): ts.Node {
				if(ts.isIdentifier(node) && vars.hasOwnProperty(node.text)) {
					node = createLiteral(vars[node.text])
				}

				// clear the position to prevent scrambled input when .getText is used
				node.pos = -1
				node.end = -1

				return ts.visitEachChild(node, visit, context)
			}

			return ts.visitNode(root, visit)
		}
	]

	return (vars: Vars): T => {
		const {transformed} = ts.transform(source, transformers(vars))
		const expression = transformed[0].statements

		if(expression.length === 1) {
			return expression[0] as T
		}
		else {
			return expression as any as T
		}
	}
}
