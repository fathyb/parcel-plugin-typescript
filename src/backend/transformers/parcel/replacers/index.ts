import * as ts from 'typescript'

import {Scope} from '../../../ast-utils/scope'

export * from './fs'
export * from './globals'
export * from './process-env'

export interface ReplacerOptions {
	fileName: string
	node: ts.Node
	scope: Scope
	globals: Map<string, ts.VariableDeclaration>
	addGlobal(name: string): void
}
