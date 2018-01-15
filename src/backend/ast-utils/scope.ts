import * as ts from 'typescript'

import {ImportDependency} from '../transformers/paths'

export interface ImportedVariable {
	type: 'import'
	from: string
	name?: string
}

export interface Variable {
	type: 'variable'
}

export type AnyVariable = Variable | ImportedVariable

export class Scope {
	public collectModules: boolean
	private readonly scope: Map<string, AnyVariable>

	constructor(
		private readonly dependencies: ImportDependency[],
		previous?: Scope
	) {
		if(previous) {
			this.collectModules = previous.collectModules
			this.scope = new Map(previous.scope)
		}
		else {
			this.collectModules = true
			this.scope = new Map()
		}
	}

	public get(variable: string): AnyVariable | undefined {
		return this.scope.get(variable)
	}

	public has(variable: string) {
		return this.scope.has(variable)
	}

	public hasModule(source: string) {
		return this.dependencies.find(dep => dep.source === source)
	}

	public getRequiredModule(node: ts.Node): string|null {
		if(ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
			const {expression, arguments: [modulePath]} = node

			if(expression.text === 'require' && modulePath && ts.isStringLiteral(modulePath)) {
				return modulePath.text
			}
		}

		return null
	}

	public collect(node: ts.Node) {
		const {collectModules, dependencies, scope} = this

		if(ts.isVariableDeclaration(node)) {
			const {name, initializer} = node
			const required = initializer && this.getRequiredModule(initializer)

			if(required) {
				dependencies.push({
					source: required,
					position: initializer!.pos
				})
			}

			if(ts.isIdentifier(name)) {
				if(required) {
					scope.set(name.text, {
						type: 'import',
						from: required,
						name: name.text
					})
				}
				else {
					scope.set(name.text, {
						type: 'variable'
					})
				}
			}
		}
		else if(
			collectModules && ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) &&
			node.importClause && node.importClause.namedBindings
		) {
			const {namedBindings} = node.importClause
			const {text: from} = node.moduleSpecifier
			const type = 'import'

			if(ts.isNamespaceImport(namedBindings)) {
				scope.set(namedBindings.name.text, {type, from})
			}
			else {
				namedBindings.elements.forEach(({propertyName, name}) => {
					const prop = propertyName
						? propertyName.text
						: name.text

					dependencies.push({
						source: from,
						position: node.moduleSpecifier.pos
					})
					scope.set(name.text, {
						type, from,
						name: prop
					})
				})
			}
		}
	}
}
