import ipc = require('node-ipc')

import {Emitter} from '../../../utils/emitter'
import {Angular, TypeScript} from '../message'

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

const messageEmitter = new Emitter<Angular.Response>()
let idCounter = 0

export function CompileAngularFile(
	tsConfig: string,
	file: string
): Promise<Angular.CompilationResponse> {
	return request({
		id: idCounter++,
		type: 'angular:compile',
		tsConfig, file
	})
}

export function CompileFile(
	tsConfig: string, file: string, forPlatform: 'angular'|'other'
): Promise<TypeScript.CompilationResponse> {
	return request({
		id: idCounter++,
		type: 'typescript:compile',
		for: forPlatform,
		tsConfig, file
	})
}

export function TypeCheckFile(tsConfig: string, file: string): Promise<void> {
	return request({
		id: idCounter++,
		type: 'typescript:type-check',
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

export async function request(req: Angular.Request|TypeScript.Request): Promise<any> {
	await loadPromise

	const promise = messageEmitter.once(({id, type}) => req.id === id && req.type === type)

	ipc.of.ParcelPluginTypeScriptServer.emit('message', req)

	return promise
}
