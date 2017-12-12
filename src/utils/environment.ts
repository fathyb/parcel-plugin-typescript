import {readFileSync} from 'fs'

import commentsJson = require('comment-json')
import findUp = require('find-up')

export function hasAngularInstalled(): boolean {
	const path = findUp.sync('package.json')

	if(!path) {
		return false
	}

	try {
		const pkg = require(path)
		const deps = pkg && Object.assign({}, pkg.dependencies || {}, pkg.devDependencies || {})
		const angular = deps && deps['@angular/core']

		return typeof angular === 'string'
	}
	catch(_) {
		return false
	}
}

export type AngularBuildMode = 'aot'|'jit'

export interface PluginConfiguration {
	transpileOnly: boolean
	angular: {
		watch: AngularBuildMode
		build: AngularBuildMode
	}
}

const defaultConfig: PluginConfiguration = {
	transpileOnly: false,
	angular: {
		watch: 'jit',
		build: 'aot'
	}
}

export function getPluginConfig(): PluginConfiguration {
	const path = findUp.sync('tsconfig.json')

	if(!path) {
		return defaultConfig
	}

	try {
		const {
			transpileOnly = defaultConfig.transpileOnly,
			angular: {
				build = defaultConfig.angular.build,
				watch = defaultConfig.angular.watch
			} = {}
		} = commentsJson.parse(readFileSync(path, {encoding: 'utf-8'})).parcelTsPluginOptions || {} as PluginConfiguration

		if(typeof transpileOnly !== 'boolean') {
			throw new Error('[ParcelTypeScriptPlugin] parcelTsPluginOptions.transpileOnly should be a boolean')
		}

		if(build !== 'aot' && build !== 'jit') {
			throw new Error('[ParcelTypeScriptPlugin] parcelTsPluginOptions.angular.build should be a "jit" or "aot"')
		}

		if(watch !== 'aot' && watch !== 'jit') {
			throw new Error('[ParcelTypeScriptPlugin] parcelTsPluginOptions.angular.watch should be a "jit" or "aot"')
		}

		return {
			transpileOnly,
			angular: {build, watch}
		}
	}
	catch(_) {
		return defaultConfig
	}
}
