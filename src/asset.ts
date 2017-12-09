import * as typescript from 'typescript'

import JSAsset = require('parcel-bundler/lib/assets/JSAsset')
import config = require('parcel-bundler/lib/utils/config')

import {formatDiagnostic} from './format'

const compilerServices = new WeakMap<any, typescript.LanguageService>()

export = class TSAsset extends JSAsset {
	public async parse() {
		// Get the current build context shared TypeScript instance
		const services = await this.getCompilerService()

		// Transpile Module using TypeScript
		const output = services.getEmitOutput(this.name)
		const syntacticErrors = services.getSyntacticDiagnostics(this.name)

		// TODO: properly log this
		if(syntacticErrors.length > 0) {
			const frame = formatDiagnostic(syntacticErrors, process.cwd())

			throw new Error(frame)
		}

		const semanticDiags = services.getSemanticDiagnostics(this.name)

		console.log(formatDiagnostic(semanticDiags, process.cwd()))

		// TODO : properly match the file
		const file = output.outputFiles.pop() // .find(output => output.name === this.name)
		const source = file && file.text

		if(!source) {
			throw new Error('TypeScript did not provide any output')
		}

		this.contents = source

		// Parse result as ast format through babylon
		return super.parse(this.contents)
	}

	private async getTsConfig() {
		const tsconfig = await config.load(this.name, ['tsconfig.json'])
		const transpilerOptions = {
			compilerOptions: {
				module: 'commonjs',
				jsx: 'preserve'
			},
			fileName: this.basename
		} as any

		// Overwrite default if config is found
		if(tsconfig) {
			transpilerOptions.compilerOptions = tsconfig.compilerOptions
			transpilerOptions.files = tsconfig.files
			transpilerOptions.include = tsconfig.include
			transpilerOptions.exclude = tsconfig.exclude
		}

		transpilerOptions.compilerOptions.noEmit = false

		return transpilerOptions
	}

	private async getCompilerService() {
		// Fetch the instance linked to our parser
		let service = compilerServices.get(this.options.parser)

		// If we already have the service in cache let's reuse it
		if(service) {
			return service
		}

		const tsconfig = await this.getTsConfig()

		// Turn the tsconfig object into TypeScript command line options
		const {fileNames, options} = typescript.parseJsonConfigFileContent(
			tsconfig,
			typescript.sys,
			// TODO: do not use process.cwd()
			process.cwd()
		)
		// We will keep a revision index for each source file here
		const files = {} as {[k: string]: {version: number}}

		// initialize the list of files
		fileNames.forEach(fileName => files[fileName] = {version: 0})

		// A host to tell the service how to parse/handle the project
		const servicesHost: typescript.LanguageServiceHost = {
			getScriptFileNames: () => fileNames,
			getScriptVersion: fileName => files[fileName] && files[fileName].version.toString(),
			getScriptSnapshot: fileName => {
				if(!typescript.sys.fileExists(fileName)) {
					return
				}

				const content = typescript.sys.readFile(fileName)

				if(content) {
					return typescript.ScriptSnapshot.fromString(content)
				}
			},
			getCurrentDirectory: () => process.cwd(),
			getCompilationSettings: () => options,
			getDefaultLibFileName: projectOptions => typescript.getDefaultLibFilePath(projectOptions),
			fileExists: typescript.sys.fileExists,
			readFile: typescript.sys.readFile,
			readDirectory: typescript.sys.readDirectory
		}

		// Create the language service host using the configuration and user options
		service = typescript.createLanguageService(servicesHost, typescript.createDocumentRegistry())

		// Save the service for a future use
		compilerServices.set(this.options.parser, service)

		return service
	}
}
