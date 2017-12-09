export = (bundler: any) => {
	bundler.addAssetType('ts', require.resolve('./asset'))
	bundler.addAssetType('tsx', require.resolve('./asset'))
}
