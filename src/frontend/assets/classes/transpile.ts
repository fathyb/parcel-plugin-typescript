import {Configuration, loadConfiguration} from '../../../backend/config-loader'
import {Transpiler} from '../../../backend/transpiler'
import {CompileResult} from '../../../interfaces'

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

		public async transpile(code: string): Promise<string> {
			const transpiler = await this.transpiler
			const {sources} = transpiler.transpile(code, this.name)

			return processSourceMaps(this, sources).js
		}
	}
}

export function processSourceMaps<T extends CompileResult['sources']>(asset: JSAsset, sources: T): T {
	if(sources.sourceMap) {
		const sourceMapObject = JSON.parse(sources.sourceMap)

		sourceMapObject.sources = [asset.relativeName]
		sourceMapObject.sourcesContent = [asset.contents]

		asset.sourceMap = sourceMapObject

		// Remove the source map URL
		sources.js = sources.js.substring(0, sources.js.lastIndexOf('//# sourceMappingURL'))
	}

	return sources
}
