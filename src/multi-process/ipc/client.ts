import ipc = require('node-ipc')

import {Emitter} from '../../utils/emitter'
import {AngularCompilationResponse, Request, Response} from '../message'

ipc.config.id = 'worker.' + Math.random().toString(36)
ipc.config.retry = 1500
ipc.config.silent = true

const loadPromise = new Promise<void>(resolve =>
	ipc.connectTo('ParcelPluginTypeScriptServer', () => {
		ipc.of.ParcelPluginTypeScriptServer.on('message', (message: string) =>
			messageEmitter.emit(JSON.parse(message))
		)

		resolve()
	})
)

const messageEmitter = new Emitter<Response>()
let idCounter = 0

export function CompileAngularFile(
	tsConfig: string,
	file: string
): Promise<AngularCompilationResponse> {
	return request({
		id: idCounter++,
		type: 'angular:compile',
		tsConfig, file
	})
}

export function ReadVirtualFile(file: string): Promise<string> {
	return request({
		id: idCounter++,
		type: 'angular:vfs:read',
		file
	}).then(response => response.contents)
}

export async function request(req: Request): Promise<any> {
	await loadPromise

	const promise = messageEmitter.once(({id}) => req.id === id)

	ipc.of.ParcelPluginTypeScriptServer.emit('message', req)

	return promise
}
