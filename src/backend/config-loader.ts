import {dirname} from 'path'

import * as ts from 'typescript'

import commentsJson = require('comment-json')
import findUp = require('find-up')

import {readFile} from '../utils/fs'

export interface Configuration extends ts.ParsedCommandLine {
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

	// TODO: use the ParsedCommandLine for the type roots
	const {typeRoots} = tsconfig

	if(typeRoots && Array.isArray(typeRoots)) {
		tsconfig.include = [
			...(tsconfig.include || []),
			...typeRoots.map((root: string) => `${root.replace(/(\/|\\)*$/, '')}/**/*`)
		]
	}

	const config = {
		...ts.parseJsonConfigFileContent(tsconfig, ts.sys, dirname(configPath)),
		path: configPath
	}

	let {options} = config

	config.options = options = {
		module: ts.ModuleKind.CommonJS,
		moduleResolution: ts.ModuleResolutionKind.NodeJs,
		...options,
		noEmit: false,
		outDir: undefined
	}

	configCache[dirname(configPath)] = config

	return config
}
