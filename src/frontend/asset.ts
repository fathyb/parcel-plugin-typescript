import JSAsset = require('parcel-bundler/src/assets/JSAsset')

import {injectIntoWorker} from '../injector'

import {reportDiagnostics} from '../backend/reporter'
import {LanguageService} from '../backend/service'
import {ConfigurationLoader} from './config-loader'

injectIntoWorker()

export = class TSAsset extends JSAsset {
	private service: ConfigurationLoader<LanguageService>

	constructor(name: string, pkg: string, options: any) {
		super(name, pkg, options)

		this.service = new ConfigurationLoader(name, config =>
			new LanguageService(config)
		)
	}

	public async parse(_: string) {
		const service = await this.service.wait()
		const result = service.parse(this.name)

		reportDiagnostics(this.name, result)

		this.contents = result.transpile().sources.js

		// Parse result as ast format through babylon
		return super.parse(this.contents)
	}
}
