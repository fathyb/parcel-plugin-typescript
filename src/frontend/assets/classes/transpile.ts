import {Configuration, loadConfiguration} from '../../../backend/config-loader'
import {Transpiler} from '../../../backend/transpiler'

import {JSAsset} from '../js-asset'

export interface TranspileAsset extends JSAsset {
	config: Promise<Configuration>

	transpile(code: string): Promise<string>
}

export function MakeTranspileAsset(name: string, pkg: string, options: any): {new(): TranspileAsset} {
	const {parser} = options
	const Asset = parser.findParser('file.js') as typeof JSAsset

	return class TSAsset extends Asset {
		public readonly config: Promise<Configuration>
		private readonly transpiler: Promise<Transpiler>

		constructor() {
			super(name, pkg, options)

			this.config = loadConfiguration(name)
			this.transpiler = this.config.then(config => new Transpiler(config))
		}

		public async parse(code: string) {
			const contents = await this.transpile(code)

			this.contents = contents

			// Parse result as ast format through babylon
			return super.parse(this.contents)
		}

		public async transpile(code: string) {
			const transpiler = await this.transpiler
			const result = transpiler.transpile(code, this.name)

			return result.sources.js
		}
	}
}
