import JSAsset = require('parcel-bundler/lib/assets/JSAsset')

import {Configuration, loadConfiguration} from '../../backend/config-loader'
import {CompileFile} from '../multi-process/ipc/client'

export = class TSAsset extends JSAsset {
	private readonly config: Promise<Configuration>

	constructor(name: string, pkg: string, options: any) {
		super(name, pkg, options)

		this.config = loadConfiguration(name)
	}

	public async parse() {
		const config = await this.config
		const result = await CompileFile(config.path, this.name, 'other')

		this.contents = result.sources.js

		// Parse result as ast format through babylon
		return super.parse(this.contents)
	}
}
