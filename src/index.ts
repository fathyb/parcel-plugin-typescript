import {inject} from './frontend/injector/master'

export = (bundler: any) => {
	if(bundler.farm !== null) {
		throw new Error('invariant: farm should be null')
	}

	inject()

	bundler.addAssetType('ts', require.resolve('./frontend/asset'))
	bundler.addAssetType('tsx', require.resolve('./frontend/asset'))
}
