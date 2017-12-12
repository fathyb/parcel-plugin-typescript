import {dirname, resolve} from 'path'

import {TemplateAsset} from '../assets/angular/template'

interface CacheEntry {
	original: string
	generated: string
}

const cache = new Map<string, CacheEntry>()
const fileResources = new Map<string, string[]>()

export async function processResource(
	file: string, pkg: string, options: {}, parser: any, code?: string
): Promise<string> {
	const cached = cache.get(file)

	if(cached && cached.original === code) {
		return cached.generated
	}

	const asset = /\.html/.test(file)
		? new TemplateAsset(file, pkg, options)
		: parser.getAsset(file, pkg, options)

	if(code) {
		asset.contents = code
	}

	const processed = await asset.process()
	const generated = processed[asset.type]

	cache.set(file, {
		original: asset.contents!,
		generated
	})

	fileResources.set(file, Array
		.from(asset.dependencies.keys() as string[])
		.filter(key => !/^_css_loader/.test(key))
		.map(k => resolve(dirname(file), k))
	)

	return generated
}

export function getFileResources(file: string): string[] {
	const resource = fileResources.get(file)

	if(!resource) {
		throw new Error(`Cannot find resources for file ${file}`)
	}

	return resource
}
