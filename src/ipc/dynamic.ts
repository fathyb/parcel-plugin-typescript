import {tmpNameSync} from 'tmp'

export function setSocketPath(name: string): string {
	const prop = envVarName(name)
	const {[prop]: socket} = process.env

	if(socket) {
		return socket
	}

	return process.env[prop] = tmpNameSync()
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
