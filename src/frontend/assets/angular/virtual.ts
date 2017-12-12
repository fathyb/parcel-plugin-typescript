import JSAsset = require('parcel-bundler/lib/assets/JSAsset')

import {ReadVirtualFile} from '../../multi-process/ipc/client'

export = class VirtualAsset extends JSAsset {
	public async load(): Promise<string> {
		if(/\.ng(factory|style)\.js$/.test(this.name)) {
			const file = await ReadVirtualFile(this.name)

			if(file) {
				return file
			}
		}

		return super.load()
	}
}
