import {dirname, resolve} from 'path'

import {TemplateAsset} from '../assets/angular/template'

interface CacheEntry {
	original: string
	generated: string
}

const cache = new Map<string, CacheEntry>()
const fileResources = new Map<string, string[]>()

export async function processHTMLResource(
	file: string, code: string, bundler: any
): Promise<string> {
	const cached = cache.get(file)

	if(cached && cached.original === code) {
		return cached.generated
	}

	const asset = new TemplateAsset(file, bundler.package, bundler.options)

	asset.contents = code

	const {html} = await asset.process()

	cache.set(file, {
		original: code,
		generated: html
	})

	fileResources.set(file, Array.from(asset.dependencies.keys()).map(k => resolve(dirname(file), k)))

	return html
}

export function getFileResources(file: string): string[] {
	const resource = fileResources.get(file)

	if(!resource) {
		throw new Error(`Cannot find resources for file ${file}`)
	}

	return resource
}
