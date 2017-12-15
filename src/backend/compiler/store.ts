import {readFileSync} from 'fs'
import * as ts from 'typescript'

export class FileStore {
	public static shared(): FileStore {
		let {sharedInstance} = this

		if(sharedInstance) {
			return sharedInstance
		}

		sharedInstance = new FileStore()

		this.sharedInstance = sharedInstance

		return sharedInstance
	}
	private static sharedInstance: FileStore|null = null

	public changedFiles: string[] = []
	private readonly files: {[key: string]: string} = {}
	private readonly sources: {[key: string]: ts.SourceFile} = {}

	public readFile(path: string, onlyCache = false): string|undefined {
		if(!/^\//.test(path)) {
			throw new Error('Path should be absolute')
		}

		const {files} = this
		let file = files[path]

		if(file) {
			return file
		}

		if(onlyCache) {
			return
		}

		try {
			file = readFileSync(path, {encoding: 'utf-8'})
		}
		catch(_) {
			return
		}

		files[path] = file

		return file
	}

	public readSource(path: string, target: ts.ScriptTarget): ts.SourceFile {
		let source = this.sources[path]

		if(source) {
			return source
		}

		const file = this.readFile(path)

		if(!file) {
			throw new Error(`Cannot find file ${path}`)
		}

		source = ts.createSourceFile(path, file, target)

		this.sources[path] = source

		return source
	}

	public writeFile(path: string, contents: string) {
		if(!/^\//.test(path)) {
			throw new Error('Path should be absolute')
		}

		delete this.sources[path]

		this.files[path] = contents
	}

	public getDirectories(path = '/'): string[] {
		if(!/^\//.test(path)) {
			throw new Error('Path should be absolute')
		}

		return Object
			.keys(this.files)
			.filter(dir => dir.indexOf(path) === 0)
			.sort()
			.filter((item, index, dirs) => !index || item !== dirs[index - 1])
	}

	public invalidate(path: string): void {
		if(path in this.files) {
			this.changedFiles.push(path)

			delete this.sources[path]

			this.files[path] = readFileSync(path, {encoding: 'utf-8'})
		}
	}

	public getFiles(directory = '/'): string[] {
		return Object
			.keys(this.files)
			.filter(path => path.indexOf(directory) === 0)
	}
}
