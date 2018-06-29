// tslint:disable:no-var-requires

import JSAssetLib = require('parcel/lib/assets/JSAsset')

export const JSAsset: typeof JSAssetLib = parseInt(process.versions.node, 10) < 8
	? require('parcel/lib/assets/JSAsset')
	: require('parcel/src/assets/JSAsset')

export type JSAsset = JSAssetLib
