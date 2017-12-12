import {inject} from './frontend/injector/master'

export = (bundler: any) => {
	inject(bundler)

	bundler.addAssetType('js', require.resolve('./frontend/assets/virtual'))
	bundler.addAssetType('ts', require.resolve('./frontend/assets/angular'))
	bundler.addAssetType('tsx', require.resolve('./frontend/assets/angular'))
}
