import * as fs from 'fs'
import {join} from 'path'
import * as ts from 'typescript'

import {TypeScriptFileRefactor} from './refactor'

function recursiveSymbolExportLookup(
	refactor: TypeScriptFileRefactor,
	symbolName: string,
	host: ts.CompilerHost,
	program: ts.Program
): string | null {
	// Check this file.
	const hasSymbol = (refactor.findAstNodes(null, ts.SyntaxKind.ClassDeclaration) as ts.ClassDeclaration[])
		.some(cd => cd.name !== undefined && cd.name.text === symbolName)

	if(hasSymbol) {
		return refactor.fileName
	}

	// We found the bootstrap variable, now we just need to get where it's imported.
	const exports = refactor.findAstNodes(null, ts.SyntaxKind.ExportDeclaration) as ts.ExportDeclaration[]

	for(const decl of exports) {
		if(!decl.moduleSpecifier || decl.moduleSpecifier.kind !== ts.SyntaxKind.StringLiteral) {
			continue
		}

		const modulePath = (decl.moduleSpecifier as ts.StringLiteral).text
		const resolvedModule = ts.resolveModuleName(modulePath, refactor.fileName, program.getCompilerOptions(), host)

		if(!resolvedModule.resolvedModule || !resolvedModule.resolvedModule.resolvedFileName) {
			return null
		}

		const module = resolvedModule.resolvedModule.resolvedFileName

		if(!decl.exportClause) {
			const moduleRefactor = new TypeScriptFileRefactor(module, host, program)
			const maybeModule = recursiveSymbolExportLookup(moduleRefactor, symbolName, host, program)

			if(maybeModule) {
				return maybeModule
			}
			continue
		}

		const binding = decl.exportClause as ts.NamedExports

		for(const specifier of binding.elements) {
			if(specifier.name.text === symbolName) {
				// If it's a directory, load its index and recursively lookup.
				if(fs.statSync(module).isDirectory()) {
					const indexModule = join(module, 'index.ts')

					if(fs.existsSync(indexModule)) {
						const indexRefactor = new TypeScriptFileRefactor(indexModule, host, program)
						const maybeModule = recursiveSymbolExportLookup(indexRefactor, symbolName, host, program)

						if(maybeModule) {
							return maybeModule
						}
					}
				}

				// Create the source and verify that the symbol is at least a class.
				const source = new TypeScriptFileRefactor(module, host, program)
				const valid = (source.findAstNodes(null, ts.SyntaxKind.ClassDeclaration) as ts.ClassDeclaration[])
					.some(cd => cd.name !== undefined && cd.name.text === symbolName)

				if(valid) {
					return module
				}
			}
		}
	}

	return null
}

function symbolImportLookup(
	refactor: TypeScriptFileRefactor, symbolName: string, host: ts.CompilerHost, program: ts.Program
): string | null {
	// We found the bootstrap variable, now we just need to get where it's imported.
	const imports = refactor.findAstNodes(null, ts.SyntaxKind.ImportDeclaration) as ts.ImportDeclaration[]

	for(const decl of imports) {
		if(!decl.importClause || !decl.moduleSpecifier || decl.moduleSpecifier.kind !== ts.SyntaxKind.StringLiteral) {
			continue
		}

		const resolvedModule = ts.resolveModuleName(
			(decl.moduleSpecifier as ts.StringLiteral).text, refactor.fileName, program.getCompilerOptions(), host
		)

		if(!resolvedModule.resolvedModule || !resolvedModule.resolvedModule.resolvedFileName) {
			continue
		}

		const module = resolvedModule.resolvedModule.resolvedFileName

		if(decl.importClause.namedBindings && decl.importClause.namedBindings.kind === ts.SyntaxKind.NamespaceImport) {
			const binding = decl.importClause.namedBindings as ts.NamespaceImport

			if(binding.name.text === symbolName) {
				// This is a default export.
				return module
			}
		}
		else if(decl.importClause.namedBindings && decl.importClause.namedBindings.kind === ts.SyntaxKind.NamedImports) {
			const binding = decl.importClause.namedBindings as ts.NamedImports

			for(const specifier of binding.elements) {
				if(specifier.name.text === symbolName) {
					// Create the source and recursively lookup the import.
					const source = new TypeScriptFileRefactor(module, host, program)
					const maybeModule = recursiveSymbolExportLookup(source, symbolName, host, program)

					if(maybeModule) {
						return maybeModule
					}
				}
			}
		}
	}

	return null
}

export function resolveEntryModuleFromMain(mainPath: string, host: ts.CompilerHost, program: ts.Program) {
	const source = new TypeScriptFileRefactor(mainPath, host, program)
	const bootstrap =
		(source.findAstNodes(source.sourceFile, ts.SyntaxKind.CallExpression, true) as ts.CallExpression[])
		.filter(call => {
			const access = call.expression as ts.PropertyAccessExpression

			return access.kind === ts.SyntaxKind.PropertyAccessExpression
				&& access.name.kind === ts.SyntaxKind.Identifier
				&& (access.name.text === 'bootstrapModule' || access.name.text === 'bootstrapModuleFactory')
		})
		.map(node => node.arguments[0] as ts.Identifier)
		.filter(node => node.kind === ts.SyntaxKind.Identifier)

	if(bootstrap.length !== 1) {
		throw new Error('Tried to find bootstrap code, but could not. Specify either '
			+ 'statically analyzable bootstrap code or pass in an entryModule '
			+ 'to the plugins options.')
	}

	const bootstrapSymbolName = bootstrap[0].text
	const module = symbolImportLookup(source, bootstrapSymbolName, host, program)

	if(module) {
		return `${module.replace(/\.ts$/, '')}#${bootstrapSymbolName}`
	}

	// shrug... something bad happened and we couldn't find the import statement.
	throw new Error('Tried to find bootstrap code, but could not. Specify either '
		+ 'statically analyzable bootstrap code or pass in an entryModule '
		+ 'to the plugins options.')
}
