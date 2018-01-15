import * as ts from 'typescript'

import {FileStore} from './store'

export class Host {
	protected readonly host: ts.CompilerHost
	private readonly setParentNodes = true

	constructor(
		options: ts.CompilerOptions,
		public readonly store = FileStore.shared()
	) {
		this.host = ts.createCompilerHost(options, this.setParentNodes)
	}

	public fileExists(path: string) {
		return this.store.exists(path) || this.host.fileExists(path)
	}

	public readFile(fileName: string) {
		return this.store.readFile(fileName)
	}
}

export class CompilerHost extends Host implements ts.CompilerHost {
	public useCaseSensitiveFileNames(): boolean {
		return this.host.useCaseSensitiveFileNames()
	}

	public getSourceFile(
		fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void
	): ts.SourceFile {
		try {
			return this.store.readSource(fileName, languageVersion)
		}
		catch(err) {
			if(onError) {
				onError(err.message || err)
			}
			else {
				throw err
			}

			return undefined as any
		}
	}

	public getDefaultLibFileName(options: ts.CompilerOptions): string {
		return this.host.getDefaultLibFileName(options)
	}

	public writeFile(fileName: string, data: string) {
		this.store.writeFile(fileName, data)
	}

	public getCurrentDirectory(): string {
		return this.host.getCurrentDirectory()
	}

	public getDirectories(path: string): string[]  {
		return this.store.getDirectories(path)
	}

	public getCanonicalFileName(fileName: string): string {
		return this.host.getCanonicalFileName(this.resolve(fileName))
	}

	public getNewLine(): string {
		return this.host.getNewLine()
	}

	private resolve(path: string) {
		return path
	}
}

export class ConfigHost extends Host implements ts.ParseConfigHost {
	public useCaseSensitiveFileNames = this.host.useCaseSensitiveFileNames()

	constructor() {
		super({}, new FileStore())
	}

	public getDeepFiles(): string[] {
		return this.store.getFiles()
	}

	public readDirectory(
		rootDir: string,
		extensions: ReadonlyArray<string>,
		excludes: ReadonlyArray<string> | undefined,
		includes: ReadonlyArray<string>,
		depth?: number
	) {
		return ts.sys.readDirectory(rootDir, extensions, excludes, includes, depth)
	}
}
