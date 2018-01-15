import * as path from 'path'
import * as ts from 'typescript'

export function resolve(
	fileName: string, modulePath: string, rootDir: string,
	options: ts.CompilerOptions, host: ts.ModuleResolutionHost
): string {
	let resolved = findModule(modulePath, fileName, rootDir, options, host)

	if(path.isAbsolute(resolved)) {
		const sourceDir = path.dirname(fileName)

		resolved = path.relative(sourceDir, resolved)

		if(!/^\.\.?/.test(resolved)) {
			resolved = `./${resolved}`
		}
	}

	return resolved
}

const cachePerRootDir = new Map<string, ts.ModuleResolutionCache>()

function getModuleResolutionCache(root: string) {
	let entry = cachePerRootDir.get(root)

	if(entry) {
		return entry
	}

	cachePerRootDir.set(root, entry = ts.createModuleResolutionCache(root, x => x))

	return entry
}

function findModule(
	modulePath: string, containingFile: string, rootDir: string,
	options: ts.CompilerOptions, host: ts.ModuleResolutionHost
): string {
	const cache = getModuleResolutionCache(rootDir)
	const {resolvedModule} = ts.resolveModuleName(modulePath, containingFile, options, host, cache)

	if(resolvedModule && !resolvedModule.isExternalLibraryImport) {
		return resolvedModule.resolvedFileName
	}

	return modulePath
}
