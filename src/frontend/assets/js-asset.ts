import JSAssetLib = require('parcel-bundler/lib/assets/JSAsset')
import JSAssetSrc = require('parcel-bundler/src/assets/JSAsset')

export const JSAsset: typeof JSAssetLib = parseInt(process.versions.node, 10) < 8 ? JSAssetLib : JSAssetSrc
export type JSAsset = JSAssetLib
