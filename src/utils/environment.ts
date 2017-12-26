import {readFileSync} from 'fs'

import commentsJson = require('comment-json')
import findUp = require('find-up')

export interface PluginConfiguration {
	transpileOnly: boolean
}

const defaultConfig: PluginConfiguration = {
	transpileOnly: false
}

export function getPluginConfig(): PluginConfiguration {
	const path = findUp.sync('tsconfig.json')

	if(!path) {
		return defaultConfig
	}

	try {
		const {
			transpileOnly = defaultConfig.transpileOnly
		} = commentsJson.parse(readFileSync(path, {encoding: 'utf-8'})).parcelTsPluginOptions || {} as PluginConfiguration

		return {
			transpileOnly
		}
	}
	catch(_) {
		return defaultConfig
	}
}
