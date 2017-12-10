import * as ts from 'typescript'

export class LanguageServiceHost implements ts.LanguageServiceHost {
	public fileExists = ts.sys.fileExists
	public readFile = ts.sys.readFile
	public readDirectory = ts.sys.readDirectory

	private readonly fileNames: string[]
	private readonly fileCache = new Map<string, string>()
	private readonly files: {[k: string]: {version: number}} = {}
	private readonly options: ts.CompilerOptions

	constructor(json: any) {
		// TODO: do not use process.cwd()
		const {fileNames, options} = ts.parseJsonConfigFileContent(json, ts.sys, process.cwd())

		this.options = options
		this.fileNames = fileNames
	}

	public getScriptFileNames() {
		return this.fileNames
	}

	public getScriptVersion(fileName: string) {
		return this.files[fileName] && this.files[fileName].version.toString()
	}

	public getScriptSnapshot(fileName: string): ts.IScriptSnapshot|undefined {
		const cached = this.fileCache.get(fileName)

		if(cached) {
			return ts.ScriptSnapshot.fromString(cached)
		}

		if(!ts.sys.fileExists(fileName)) {
			return
		}

		const content = ts.sys.readFile(fileName)

		if(content) {
			this.fileCache.set(fileName, content)

			return ts.ScriptSnapshot.fromString(content)
		}
	}

	public getCurrentDirectory() {
		return process.cwd()
	}

	public getCompilationSettings() {
		return this.options
	}

	public getDefaultLibFileName(projectOptions: ts.CompilerOptions) {
		return ts.getDefaultLibFilePath(projectOptions)
	}
}
