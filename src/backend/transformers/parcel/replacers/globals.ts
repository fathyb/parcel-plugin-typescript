import * as ts from 'typescript'

import {ReplacerOptions} from '.'
import {VARS} from '../vars'

export function replaceGlobals({addGlobal, globals, node, scope}: ReplacerOptions) {
	if(ts.isIdentifier(node)) {
		const {text} = node

		if(VARS.hasOwnProperty(text) && !globals.has(text) && !scope.has(text)) {
			addGlobal(text)
		}
	}
}
