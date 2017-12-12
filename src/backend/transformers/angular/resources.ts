import {dirname, resolve} from 'path'
import * as ts from 'typescript'

import {collectDeepNodes, getFirstNode} from './ast-helpers'
import {AddNodeOperation, ReplaceNodeOperation, StandardTransform, TransformOperation} from './interfaces'
import {makeTransform} from './make-transform'

export interface ResourcesMap {
	[path: string]: string
}

export function replaceResources(
	shouldTransform: (fileName: string) => boolean
): ts.TransformerFactory<ts.SourceFile> {
	const standardTransform: StandardTransform = function(sourceFile: ts.SourceFile) {
		const ops: TransformOperation[] = []

		if(!shouldTransform(sourceFile.fileName)) {
			return ops
		}

		const resources = findResources(sourceFile)

		if(resources.length > 0) {
			// Add the replacement operations.
			ops.push(...(resources.map(resource => {
				if(resource.type === 'template') {
					const propAssign = ts.createPropertyAssignment('template', createPreProcessorNode(resource.path, resource.type))

					return new ReplaceNodeOperation(sourceFile, resource.node, propAssign)
				}
				else if(resource.type === 'style') {
					const literals = ts.createArrayLiteral(
						resource.path.map(path => createPreProcessorNode(path, resource.type))
					)

					const propAssign = ts.createPropertyAssignment('styles', literals)

					return new ReplaceNodeOperation(sourceFile, resource.node, propAssign)
				}

				throw new Error('invariant error')
			})))

			// If we added a require call, we need to also add typings for it.
			// The typings need to be compatible with node typings, but also work by themselves.
			// interface NodeRequire {(id: string): any;}
			const nodeRequireInterface = ts.createInterfaceDeclaration([], [], 'NodeRequire', [], [], [
				ts.createCallSignature([], [
					ts.createParameter([], [], undefined, 'id', undefined,
						ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
					)
				], ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword))
			])

			// declare var require: NodeRequire;
			const varRequire = ts.createVariableStatement(
				[ts.createToken(ts.SyntaxKind.DeclareKeyword)],
				[ts.createVariableDeclaration('require', ts.createTypeReferenceNode('NodeRequire', []))]
			)

			ops.push(new AddNodeOperation(sourceFile, getFirstNode(sourceFile)!, nodeRequireInterface))
			ops.push(new AddNodeOperation(sourceFile, getFirstNode(sourceFile)!, varRequire))
		}

		return ops
	}

	return makeTransform(standardTransform)
}

export interface SourceFileTemplateResource {
	type: 'template'
	path: string
	node: ts.PropertyAssignment
}
export interface SourceFileStyleResource {
	type: 'style'
	path: string[]
	node: ts.PropertyAssignment
}

export type SourceFileResource = SourceFileTemplateResource | SourceFileStyleResource

export function findResources(sourceFile: ts.SourceFile): SourceFileResource[] {
	// Find all object literals.
	return collectDeepNodes<ts.ObjectLiteralExpression>(sourceFile, ts.SyntaxKind.ObjectLiteralExpression)
		// Get all their property assignments.
		.map(node => collectDeepNodes<ts.PropertyAssignment>(node, ts.SyntaxKind.PropertyAssignment))
		// Flatten into a single array (from an array of array<property assignments>).
		.reduce((prev, curr) => curr ? prev.concat(curr) : prev, [])
		// We only want property assignments for the templateUrl/styleUrls keys.
		.filter((node: ts.PropertyAssignment) => {
			const key = getContentOfKeyLiteral(node.name)

			if(!key) {
				// key is an expression, can't do anything.
				return false
			}

			return key === 'templateUrl' || key === 'styleUrls'
		})
		.map((node): SourceFileResource|undefined => {
			const key = getContentOfKeyLiteral(node.name)

			if(key === 'templateUrl') {
				const path = getResourceRequest(node.initializer, sourceFile)

				return {path, node, type: 'template'}
			}
			else if(key === 'styleUrls') {
				const arr = collectDeepNodes<ts.ArrayLiteralExpression>(node, ts.SyntaxKind.ArrayLiteralExpression)

				if(!arr || arr.length === 0 || arr[0].elements.length === 0) {
					return
				}

				return {
					type: 'style',
					path: arr[0].elements.map(element => getResourceRequest(element, sourceFile)),
					node
				}
			}
		})
		.filter(resource => resource !== undefined) as SourceFileResource[]
}

function getContentOfKeyLiteral(node?: ts.Node): string | null {
	if(!node) {
		return null
	}
	else if(node.kind === ts.SyntaxKind.Identifier) {
		return (node as ts.Identifier).text
	}
	else if(node.kind === ts.SyntaxKind.StringLiteral) {
		return (node as ts.StringLiteral).text
	}
	else {
		return null
	}
}

function getResourceRequest(element: ts.Expression, sourceFile: ts.SourceFile) {
	let path: string|null = null

	if(
		element.kind === ts.SyntaxKind.StringLiteral ||
		element.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral
	) {
		const url = (element as ts.StringLiteral).text

		// If the URL does not start with ./ or ../, prepends ./ to it.
		path = `${/^\.?\.\//.test(url) ? '' : './'}${url}`
	} else {
		// if not string, just use expression directly
		path = element.getFullText(sourceFile)
	}

	const directory = dirname(sourceFile.fileName)

	return resolve(directory, path)
}

function createPreProcessorNode(path: string, type: 'template'|'style') {
	const base64 = new Buffer(path).toString('base64')

	return ts.createLiteral(`_PRAGMA_PARCEL_TYPESCRIPT_PLUGIN_PREPROCESS_${type.toUpperCase()}(${base64})`)
}
