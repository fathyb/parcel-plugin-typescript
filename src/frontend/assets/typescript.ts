import {Configuration, loadConfiguration} from '../../backend/config-loader'
import {IPCClient} from '../../backend/worker/client'

import {JSAsset} from './js-asset'

export = function MakeTranspileAsset(name: string, pkg: string, options: any) {
	const {parser} = options
	const Asset = parser.findParser('file.js') as typeof JSAsset

	return new (class TSAsset extends Asset {
		private readonly config: Promise<Configuration>

		constructor() {
			super(name, pkg, options)

			this.config = loadConfiguration(name)
		}

		public async parse() {
			const config = await this.config
			const result = await IPCClient.compile({file: this.name, tsConfig: config.path})

			this.contents = result.sources.js

			// Parse result as ast format through babylon
			return super.parse(this.contents)
		}
	})()
}
