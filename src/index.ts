import {loadConfiguration} from './backend/config-loader'
import {TypeScriptServer} from './backend/worker/index'

export = async (bundler: any) => {
	if(process.env['PARCEL_PLUGIN_TYPESCRIPT_DISABLE'] === 'true') {
		return
	}

	const {watch, rootDir} = bundler.options
	const {plugin: {transpileOnly}} = await loadConfiguration(`${bundler.options.rootDir}/entry`, rootDir)

	if(transpileOnly) {
		bundler.addAssetType('ts', require.resolve('./frontend/assets/transpile'))
		bundler.addAssetType('tsx', require.resolve('./frontend/assets/transpile'))
	}
	else {
		// On watch mode we transpile in the asset process and type-check in a dedicated process
		// Else we transpile and type-check using a dedicated process
		const tsAsset = require.resolve(`./frontend/assets/${watch ? 'forked' : 'typescript'}`)

		bundler.addAssetType('ts', tsAsset)
		bundler.addAssetType('tsx', tsAsset)

		const server = new TypeScriptServer()

		if(!watch) {
			bundler.on('buildEnd', () => server.close())
		}
	}
}
