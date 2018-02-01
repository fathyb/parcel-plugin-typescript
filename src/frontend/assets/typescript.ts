import {Configuration, loadConfiguration} from '../../backend/config-loader'
import {IPCClient} from '../../backend/worker/client'

import {processSourceMaps} from '../../exports'
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

		public async parse(): Promise<any> {
			const config = await this.config
			const reportErrors = !config.options.noEmitOnError
			const result = await IPCClient.compile({
				file: this.name, tsConfig: config.path,
				reportErrors
			})

			if(!reportErrors) {
				const {diagnostics} = result

				if(diagnostics) {
					console.error(diagnostics)

					// tslint:disable:no-string-throw
					throw 'TypeScript errors were found while compiling'
				}
			}

			this.contents = processSourceMaps(this, result.sources).js

			// Parse result as ast format through babylon
			return super.parse(this.contents)
		}

		public generateErrorMessage(err: any) {
			return err.stack || err.message || err
		}
	})()
}
