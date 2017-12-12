import ipc = require('node-ipc')

import {AngularWorker, spawnAngularWorker} from '../controllers/angular'
import {spawnTypeScriptCheckerWorker, TypeScriptCheckerWorker} from '../controllers/typescript-checker'
import {spawnTypeScriptCompilerWorker, TypeScriptCompilerWorker} from '../controllers/typescript-compiler'
import {Angular, TypeScript} from '../message'

export function startIPCServer(bundler: any) {
	ipc.config.id = 'ParcelPluginTypeScriptServer'
	ipc.config.retry = 1500
	ipc.config.silent = true

	process.nextTick(() => {
		const {watcher} = bundler

		if(watcher) {
			watcher.on('change', (path: string) => {
				if(angularWorker !== null) {
					angularWorker.invalidate(path)
				}
			})
		}
	})

	ipc.serve(() => {
		ipc.server.on('message', async (req: Angular.Request|TypeScript.Request, socket) => {
			try {
				const {id} = req

				if(req.type === 'angular:compile') {
					const {sources, resources} = await getAngularWorker(bundler).compile(req.tsConfig, req.file)
					const response: Angular.CompilationResponse = {id, type: req.type, sources, resources}

					ipc.server.emit(socket, 'message', JSON.stringify(response))
				}
				else if(req.type === 'angular:vfs:read') {
					const contents = await getAngularWorker(bundler).read(req.file)
					const response: Angular.VFSReadResponse = {
						id, contents,
						type: req.type
					}

					ipc.server.emit(socket, 'message', JSON.stringify(response))
				}
				else if(req.type === 'typescript:compile') {
					const {sources} = await getTypeScriptCompilerWorker().compile(req.tsConfig, req.file, req.for)
					const response: TypeScript.CompilationResponse = {id, type: req.type, sources}

					ipc.server.emit(socket, 'message', JSON.stringify(response))
				}
				else if(req.type === 'typescript:type-check') {
					await getTypeScriptCheckerWorker().typeCheck(req.tsConfig, req.file)

					const response: TypeScript.TypeCheckResponse = {id, type: req.type}

					ipc.server.emit(socket, 'message', JSON.stringify(response))
				}
			}
			catch(err) {
				console.error(err)
			}
		})
		ipc.server.on('socket.disconnected', () => {
			if(angularWorker || typeScriptCompilerWorker || typeScriptCheckerWorker) {
				if(angularWorker) {
					angularWorker.stop()
					angularWorker = null
				}

				if(typeScriptCompilerWorker) {
					typeScriptCompilerWorker.stop()
					typeScriptCompilerWorker = null
				}

				if(typeScriptCheckerWorker) {
					typeScriptCheckerWorker.stop()
					typeScriptCheckerWorker = null
				}

				ipc.server.stop()

				// TODO: replace node-ipc by a better alternative asap
				process.exit(process.exitCode)
			}
		})
	})

	ipc.server.start()
}

let angularWorker: AngularWorker|null = null
let typeScriptCompilerWorker: TypeScriptCompilerWorker|null = null
let typeScriptCheckerWorker: TypeScriptCheckerWorker|null = null

function getAngularWorker(bundler: any): AngularWorker {
	if(angularWorker === null) {
		angularWorker = spawnAngularWorker(bundler)
	}

	return angularWorker
}

function getTypeScriptCompilerWorker(): TypeScriptCompilerWorker {
	if(typeScriptCompilerWorker === null) {
		typeScriptCompilerWorker = spawnTypeScriptCompilerWorker()
	}

	return typeScriptCompilerWorker
}

function getTypeScriptCheckerWorker(): TypeScriptCheckerWorker {
	if(typeScriptCheckerWorker === null) {
		typeScriptCheckerWorker = spawnTypeScriptCheckerWorker()
	}

	return typeScriptCheckerWorker
}
