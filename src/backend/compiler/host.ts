import * as ts from 'typescript'

import {FileStore} from './store'

export class CompilerHost implements ts.CompilerHost {
	public readonly store = FileStore.shared()
	private readonly host: ts.CompilerHost

	private setParentNodes = true

	constructor(options: ts.CompilerOptions) {
		this.host = ts.createCompilerHost(options, this.setParentNodes)
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

	public readFile(fileName: string) {
		return this.store.readFile(fileName)
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

	public useCaseSensitiveFileNames(): boolean {
		return this.host.useCaseSensitiveFileNames()
	}

	public getNewLine(): string {
		return this.host.getNewLine()
	}

	public fileExists(path: string) {
		return this.host.fileExists(path)
	}

	private resolve(path: string) {
		return path
	}
}
