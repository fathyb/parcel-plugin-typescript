// TODO: Ok this has become a mess, need to clean this

import {dirname, resolve} from 'path'

import Resolver = require('parcel-bundler/src/Resolver')

import {startIPCServer} from '../../multi-process/ipc/server'

/**
 * This function patch the WorkerFrame properties to interecpt
 * all messages sent from the workers.
 * When a file is updated a message will be sent to the master
 * and then dispatched to the type-checking worker.
 */
export function inject(bundler: any) {
	if(Resolver.prototype.resolveInternal !== injectedResolver) {
		Resolver.prototype.resolveInternal = injectedResolver
	}

	if(!process.send) {
		startIPCServer(bundler)
	}
}

const injectedResolver = ((resolver: () => void) =>
	function(this: any, path: string, parent: string, ...args: any[]) {
		if(/\.ngfactory$/.test(path) || /\.ngstyle$/.test(path)) {
			return resolve(dirname(parent), `${path}.js`)
		}
		if(/\.ngfactory\.js$/.test(path) || /\.ngstyle\.js$/.test(path)) {
			return resolve(dirname(parent), path)
		}

		return resolver.call(this, path, parent, ...args)
	}
)(Resolver.prototype.resolveInternal)
