import JSAsset = require('parcel-bundler/lib/assets/JSAsset')

import {Configuration, loadConfiguration} from '../../../backend/config-loader'
import {Transpiler} from '../../../backend/transpiler'

export class TranspileAsset extends JSAsset {
	protected readonly config: Promise<Configuration>
	private readonly transpiler: Promise<Transpiler>

	constructor(name: string, pkg: string, options: any) {
		super(name, pkg, options)

		this.config = loadConfiguration(name)
		this.transpiler = this.config.then(config => new Transpiler(config))
	}

	public async parse(code: string) {
		this.contents = await this.transpile(code, 'other')

		// Parse result as ast format through babylon
		return super.parse(this.contents)
	}

	protected async transpile(code: string, platform: 'angular'|'other') {
		const transpiler = await this.transpiler
		const result = transpiler.transpile(code, this.name, platform)

		return result.sources.js
	}
}
