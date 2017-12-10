import JSAsset = require('parcel-bundler/src/assets/JSAsset')

import {ConfigurationLoader} from '../backend/config-loader'
import {Transpiler} from '../backend/transpiler'
import {dispatchCheckFile} from './injector/worker'

export = class TSAsset extends JSAsset {
	private transpiler: ConfigurationLoader<Transpiler>

	constructor(name: string, pkg: string, options: any) {
		super(name, pkg, options)

		this.transpiler = new ConfigurationLoader(name, config => new Transpiler(config))
	}

	public async parse(code: string) {
		// ask for a type-check in the background
		dispatchCheckFile(this.name)

		const transpiler = await this.transpiler.wait()
		const {sources} = transpiler.transpile(code, this.name)

		this.contents = sources.js

		// Parse result as ast format through babylon
		return super.parse(this.contents)
	}
}
