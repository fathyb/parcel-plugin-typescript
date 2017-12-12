import {dirname, relative} from 'path'

import JSAsset = require('parcel-bundler/lib/assets/JSAsset')

import {Configuration, loadConfiguration} from '../../../backend/config-loader'

import {CompileAngularFile} from '../../multi-process/ipc/client'

export = class AngularAOTTSAsset extends JSAsset {
	private config: Promise<Configuration>
	private resources: string[]|null = null

	constructor(name: string, pkg: string, options: any) {
		super(name, pkg, options)

		this.config = loadConfiguration(name)
	}

	public mightHaveDependencies() {
		return true
	}

	public collectDependencies() {
		super.collectDependencies()

		const {resources} = this

		if(!resources) {
			return
		}

		const dir = dirname(this.name)

		resources.forEach(resource => {
			let path = relative(dir, resource)

			if(!/^\./.test(path)) {
				path = `./${path}`
			}

			this.addDependency(path, {})
		})
	}

	public async parse() {
		const config = await this.config
		const result = await CompileAngularFile(config.path, this.name)

		this.resources = result.resources
		this.contents = result.sources.js

		// Parse result as ast format through babylon
		return super.parse(this.contents)
	}
}
