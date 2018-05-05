// tslint:disable:no-var-requires

import JSAssetLib = require('parcel-bundler/lib/assets/JSAsset')

export const JSAsset: typeof JSAssetLib = parseInt(process.versions.node, 10) < 8
	? require('parcel-bundler/lib/assets/JSAsset')
	: require('parcel-bundler/src/assets/JSAsset')

export type JSAsset = JSAssetLib
