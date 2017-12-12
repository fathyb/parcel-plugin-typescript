import {injectAngularSupport, startServer} from './frontend/injector/master'

import {getPluginConfig, hasAngularInstalled} from './utils/environment'

export = (bundler: any) => {
	const {watch} = bundler.options
	let needIPC = true

	console.log('\n\nloading plugin\n\n')
	const {angular: angularOptions, transpileOnly} = getPluginConfig()

	// if this is an Angular project and AOT is enabled
	if(hasAngularInstalled()) {
		let tsAsset: string|null = null

		if((watch && angularOptions.watch === 'aot') || (!watch && angularOptions.build === 'aot')) {
			// Workaround for the resolving/cache issues with Angular generated files
			injectAngularSupport(bundler)

			// We register .js files for the generated ngfactory/ngstyles files
			bundler.addAssetType('js', require.resolve('./frontend/assets/angular/virtual'))

			tsAsset = require.resolve('./frontend/assets/angular/aot')
		}
		else {
			tsAsset = require.resolve('./frontend/assets/angular/jit')
		}

		bundler.addAssetType('ts', tsAsset)
		bundler.addAssetType('tsx', tsAsset)
	}
	else {
		if(transpileOnly) {
			needIPC = false

			bundler.addAssetType('ts', require.resolve('./frontend/assets/transpile'))
			bundler.addAssetType('tsx', require.resolve('./frontend/assets/transpile'))
		}
		else {
			// On watch mode we transpile in the asset process and type-check in a dedicated process
			// Else we transpile and type-check using a dedicated process
			const tsAsset = require.resolve(`./frontend/assets/${watch ? 'forked' : 'typescript'}`)

			bundler.addAssetType('ts', tsAsset)
			bundler.addAssetType('tsx', tsAsset)
		}
	}

	if(needIPC) {
		// We start our IPC server for multi-process
		startServer(bundler)
	}
}
