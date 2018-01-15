import {Configuration, loadConfiguration} from '../../../backend/configuration'
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
		private tsDependencies: Array<{source: string, position: number}>|null = null

		constructor() {
			super(name, pkg, options)

			this.config = loadConfiguration(name, options.rootDir)
			this.transpiler = this.config.then(config =>
				new Transpiler(config)
			)
		}

		public async parse(code: string) {
			this.contents = await this.transpile(code)

			if(!this.tsDependencies) {
				return super.parse(this.contents)
			}

			return {blank: true}
		}

		public collectDependencies() {
			const {tsDependencies: dependencies} = this

			if(!dependencies) {
				return super.collectDependencies()
			}

			dependencies.forEach(dep =>
				this.addDependency(dep.source, {loc: dep.position})
			)
		}

		public async pretransform() {
			const {plugin: {useTypeScriptAST}} = await this.config

			if(!useTypeScriptAST) {
				return super.pretransform()
			}
		}

		public async transform() {
			const {plugin: {useTypeScriptAST}} = await this.config

			if(!useTypeScriptAST) {
				return super.transform()
			}
		}

		public generate() {
			if(this.tsDependencies) {
				this.isAstDirty = false
			}

			return super.generate()
		}

		public mightHaveDependencies() {
			if(!this.tsDependencies) {
				return super.mightHaveDependencies()
			}

			return true
		}

		public async transpile(code: string): Promise<string> {
			const transpiler = await this.transpiler
			const {typescript, plugin} = await this.config
			const result = transpiler.transpile(code, this.name)

			this.tsDependencies = (plugin.useTypeScriptAST && result.dependencies) || null

			if(typescript.options.importHelpers && this.tsDependencies) {
				this.tsDependencies.push({
					source: 'tslib',
					position: 0
				})
			}

			return processSourceMaps(this, result.sources).js
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
