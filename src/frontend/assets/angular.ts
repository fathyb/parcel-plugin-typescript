import JSAsset = require('parcel-bundler/src/assets/JSAsset')

import {Configuration, ConfigurationLoader} from '../../backend/config-loader'

import {CompileAngularFile} from '../../multi-process/ipc/client'

export = class TSAsset extends JSAsset {
	private config: Promise<Configuration>

	constructor(name: string, pkg: string, options: any) {
		super(name, pkg, options)

		this.config = new ConfigurationLoader(name, config => config).wait()
	}

	public async parse() {
		const config = await this.config
		const result = await CompileAngularFile(config.path, this.name)

		this.contents = result.sources.js

		// Parse result as ast format through babylon
		return super.parse(this.contents)
	}
}
