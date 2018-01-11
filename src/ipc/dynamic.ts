import {join} from 'path'
import {tmpNameSync} from 'tmp'
import uuid = require('uuid/v1')

export function setSocketPath(name: string): string {
	const prop = envVarName(name)
	const {[prop]: socket} = process.env

	if(socket) {
		return socket
	}

	let path: string|null = null

	if(process.platform === 'win32') {
		path = join('\\\\?\\pipe', process.cwd(), uuid())
	}
	else {
		path = tmpNameSync()
	}

	return process.env[prop] = path
}

export function getSocketPath(name: string): string {
	const prop = envVarName(name)
	const {[prop]: socket} = process.env

	if(!socket) {
		throw new Error(`[parcel-plugin-${name}]: cannot find socket`)
	}
	return socket
}

const envVarName = (name: string) => `_PARCEL_PLUGIN_${name.toUpperCase()}_IPC_SOCKET_`
