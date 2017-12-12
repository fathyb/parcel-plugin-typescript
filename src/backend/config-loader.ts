import {dirname} from 'path'

import {ParsedCommandLine, parseJsonConfigFileContent, sys} from 'typescript'

import commentsJson = require('comment-json')
import findUp = require('find-up')

import {readFile} from '../utils/fs'

export interface Configuration extends ParsedCommandLine {
	path: string
}

const configCache: {[path: string]: Configuration} = {}

export async function loadConfiguration(path: string): Promise<Configuration> {
	const cached = Object.keys(configCache).find(cachePath => path.indexOf(cachePath) === 0)

	if(cached) {
		return configCache[cached]
	}

	const cwd = dirname(path)
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
	delete transpilerOptions.compilerOptions.outDir

	const options = {
		...parseJsonConfigFileContent(transpilerOptions, sys, process.cwd()),
		path: configPath
	}

	configCache[dirname(configPath)] = options

	return options
}
