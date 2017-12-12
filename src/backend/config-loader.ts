import {dirname} from 'path'

import {ParsedCommandLine, parseJsonConfigFileContent, sys} from 'typescript'

import commentsJson = require('comment-json')
import findUp = require('find-up')

import {readFile} from '../utils/fs'

const configCache = new Map<string, ParsedCommandLine>()

export class ConfigurationLoader<T> {
	private readonly promise: Promise<T>

	constructor(path: string, then: (config: ParsedCommandLine) => T) {
		this.promise = (async () => {
			const cwd = dirname(path)
			let options = configCache.get(cwd)

			if(!options) {
				const configPath = await findUp('tsconfig.json', {cwd})
				const tsconfig = configPath && commentsJson.parse(await readFile(configPath))
				const transpilerOptions = {
					compilerOptions: {
						module: 'commonjs',
						jsx: 'preserve'
					}
				} as any

				// Overwrite default if config is found
				if(tsconfig) {
					transpilerOptions.compilerOptions = tsconfig.compilerOptions
					transpilerOptions.files = tsconfig.files
					transpilerOptions.include = tsconfig.include
					transpilerOptions.exclude = tsconfig.exclude
				}

				transpilerOptions.compilerOptions.noEmit = false

				options = parseJsonConfigFileContent(transpilerOptions, sys, process.cwd())

				configCache.set(cwd, options)
			}

			return then(options)
		})()
	}

	public wait(): Promise<T> {
		return this.promise
	}
}
