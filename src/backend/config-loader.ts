import {dirname} from 'path'

import * as ts from 'typescript'

import commentsJson = require('comment-json')
import findUp = require('find-up')
import resolveFrom = require('resolve-from')

import {PathTransform} from '../exports'
import {readFile} from '../utils/fs'

export type TransformerList = Array<ts.TransformerFactory<ts.SourceFile>>
export interface Transformers {
	before: TransformerList
	after?: TransformerList
}

export interface Configuration {
	typescript: ts.ParsedCommandLine
	plugin: {
		transpileOnly: boolean
		transformers: Transformers
	}
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
	// TODO: "parcelTsPluginOptions" makes my eyes bleed
	const {
		compilerOptions: {
			typeRoots
		} = {} as any,
		parcelTsPluginOptions: {
			transpileOnly = false,
			transformers
		} = {} as any
	} = tsconfig

	if(typeRoots && Array.isArray(typeRoots)) {
		tsconfig.include = [
			...(tsconfig.include || []),
			...typeRoots.map((root: string) =>
				`${root.replace(/(\/|\\)*$/, '')}/**/*`
			)
		]
	}

	const base = dirname(configPath)
	const typescript = ts.parseJsonConfigFileContent(tsconfig, ts.sys, base)
	const config: Configuration = {
		typescript,
		plugin: {
			transpileOnly,
			transformers: getTransformerFactory(typescript.options, base, transformers)
		},
		path: configPath
	}

	let {options} = config.typescript

	config.typescript.options = options = {
		module: ts.ModuleKind.CommonJS,
		moduleResolution: ts.ModuleResolutionKind.NodeJs,
		...options,
		noEmit: false,
		outDir: undefined
	}

	return configCache[base] = config
}

function getTransformerFactory(options: ts.CompilerOptions, dir: string, transformers: any): Transformers {
	const before: TransformerList = [PathTransform(options)]

	if(transformers === undefined) {
		return {before, after: []}
	}

	if(typeof transformers !== 'string') {
		throw new Error('The transformers option should be a string')
	}

	const factoryPath = resolveFrom(dir, transformers)
	let factory = require(factoryPath)

	if(!factory) {
		throw new Error('Cannot import transformer factory')
	}

	if(factory.default) {
		factory = factory.default
	}

	factory = factory()

	if(factory.before) {
		if(!Array.isArray(factory.before)) {
			throw new Error('Factory.before should be a TransformerFactory array')
		}

		before.push(...factory.before)
	}

	let after: TransformerList | undefined

	if(factory.after) {
		if(!Array.isArray(factory.after)) {
			throw new Error('Factory.after should be a TransformerFactory array')
		}

		after = factory.after
	}

	return {before, after}
}
