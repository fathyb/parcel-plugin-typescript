import {TypeScriptServer} from './backend/worker/index'
import {getPluginConfig} from './utils/environment'

export = (bundler: any) => {
	const {transpileOnly} = getPluginConfig()

	if(transpileOnly) {
		bundler.addAssetType('ts', require.resolve('./frontend/assets/transpile'))
		bundler.addAssetType('tsx', require.resolve('./frontend/assets/transpile'))
	}
	else {
		// On watch mode we transpile in the asset process and type-check in a dedicated process
		// Else we transpile and type-check using a dedicated process
		const tsAsset = require.resolve(`./frontend/assets/${bundler.options.watch ? 'forked' : 'typescript'}`)

		bundler.addAssetType('ts', tsAsset)
		bundler.addAssetType('tsx', tsAsset)

		const server = new TypeScriptServer()

		if(!bundler.options.watch) {
			bundler.on('buildEnd', () => server.close())
		}
	}
}
