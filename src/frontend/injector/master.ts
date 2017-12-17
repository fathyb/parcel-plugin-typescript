// TODO: Ok this has become a mess, need to clean this

import {dirname, resolve} from 'path'

import {startIPCServer} from '../../multi-process/ipc/server'

/**
 * When generating files on the fly (eg. Angular) we need to
 * override Parcel cache and resolver for it to work properly
 */
export function inject(bundler: any) {
	const {cache, resolver} = bundler

	if(cache) {
		const Cache = cache.constructor
		const CacheWrite = Cache.prototype.write
		const CacheRead = Cache.prototype.read

		cache.write = function(this: any, file: string, data: any) {
			if(/\.ng(factory)|(style)\.js$/.test(file) || /\.ts$/.test(file)) {
				return Promise.resolve()
			}

			return CacheWrite.call(this, file, data)
		}

		cache.read = function(this: any, file: string) {
			if(/\.ng(factory)|(style)\.js$/.test(file)) {
				return Promise.resolve(null)
			}

			return CacheRead.call(this, file)
		}
	}

	const Resolver = resolver.constructor
	const ResolveInternal = Resolver.prototype.resolveInternal

	resolver.resolveInternal = function(this: any, path: string, parent: string, ...args: any[]) {
		if(/\.ngfactory$/.test(path) || /\.ngstyle$/.test(path)) {
			return resolve(dirname(parent), `${path}.js`)
		}
		if(/\.ngfactory\.js$/.test(path) || /\.ngstyle\.js$/.test(path)) {
			return resolve(dirname(parent), path)
		}

		return ResolveInternal.call(this, path, parent, ...args)
	}

	if(!process.send) {
		startIPCServer(bundler)
	}
}
