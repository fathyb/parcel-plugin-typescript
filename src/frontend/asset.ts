import JSAsset = require('parcel-bundler/src/assets/JSAsset')

import {ConfigurationLoader} from '../backend/config-loader'
import {Transpiler} from '../backend/transpiler'
import {TranspileResult} from '../interfaces'

import {dispatchCheckFile} from './injector/worker'
import {typeCheck} from './process/checker'

export = class TSAsset extends JSAsset {
	private readonly transpiler: ConfigurationLoader<Transpiler>

	constructor(name: string, pkg: string, options: any) {
		super(name, pkg, options)

		this.transpiler = new ConfigurationLoader(name, config => new Transpiler(config))
	}

	public async parse(code: string) {
		const {options} = this
		let result: TranspileResult

		// if we are not watching let's transpile and check at the same time
		if(!options.watch) {
			const [check] = await typeCheck(this.name)

			result = check.transpile()
		}
		else {
			// ask for a type-check in the background
			dispatchCheckFile(this.name)

			const transpiler = await this.transpiler.wait()

			result = transpiler.transpile(code, this.name)
		}

		this.contents = result.sources.js

		// Parse result as ast format through babylon
		return super.parse(this.contents)
	}
}
