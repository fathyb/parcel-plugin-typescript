import * as ts from 'typescript'

import {ImportDependency} from '../transformers/paths'
import {Scope} from './scope'

/// traverse and build a scope without the type-checker
export function traverse<N extends ts.Node>(
	node: N, visitor: (node: ts.Node, scope: Scope) => ts.VisitResult<ts.Node>,
	ctx: ts.TransformationContext, dependencies: ImportDependency[],
	parentScope?: Scope, collectModules = true
): N {
	const scope = new Scope(dependencies, parentScope)

	if(!parentScope) {
		scope.collect(node)
	}

	return ts.visitEachChild(node, child => {
		scope.collect(child)

		if(collectModules && scope.hasModule('fs')) {
			scope.collectModules = collectModules = false
		}

		const replacement = visitor(child, scope)

		if(replacement !== child) {
			return replacement
		}

		return traverse(child, visitor, ctx, dependencies, scope, collectModules)
	}, ctx)
}
