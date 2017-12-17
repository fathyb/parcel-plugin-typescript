import {dirname} from 'path'

import {ParsedCommandLine, parseJsonConfigFileContent, sys} from 'typescript'

import commentsJson = require('comment-json')
import findUp = require('find-up')

import {readFile} from '../utils/fs'

export interface Configuration extends ParsedCommandLine {
	path: string
}

const configCache = new Map<string, Configuration>()

export class ConfigurationLoader<T> {
	private readonly promise: Promise<T>

	constructor(path: string, then: (config: Configuration) => T) {
		this.promise = (async () => {
			const cwd = dirname(path)
			let options = configCache.get(cwd)

			if(!options) {
				const configPath = await findUp('tsconfig.json', {cwd})

				if(!configPath) {
					throw new Error('Cannot find tsconfig')
				}

				const tsconfig = configPath && commentsJson.parse(await readFile(configPath))
				const transpilerOptions = {
					compilerOptions: {
						module: 'es2015',
						moduleResolution: 'node'
					}
				} as any

				// Overwrite default if config is found
				if(tsconfig) {
					transpilerOptions.compilerOptions = {
						...transpilerOptions.compilerOptions,
						...tsconfig.compilerOptions
					}
					transpilerOptions.files = tsconfig.files
					transpilerOptions.include = tsconfig.include
					transpilerOptions.exclude = tsconfig.exclude
				}

				transpilerOptions.compilerOptions.noEmit = false

				options = {
					...parseJsonConfigFileContent(transpilerOptions, sys, process.cwd()),
					path: configPath
				}

				configCache.set(cwd, options)
			}

			return then(options)
		})()
	}

	public wait(): Promise<T> {
		return this.promise
	}
}
