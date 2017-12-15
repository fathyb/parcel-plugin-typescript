import {inject} from './frontend/injector/master'

export = (bundler: any) => {
	inject(bundler)

	bundler.addAssetType('js', require.resolve('./frontend/assets/angular/virtual'))
	bundler.addAssetType('ts', require.resolve('./frontend/assets/angular/typescript'))
	bundler.addAssetType('tsx', require.resolve('./frontend/assets/angular/typescript'))
}
