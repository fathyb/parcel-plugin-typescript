import ipc = require('node-ipc')

import {AngularCompilationResponse, NgVFSReadResponse, Request} from '../message'

import {AngularWorker, spawnAngularWorker} from '../ngserver'

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
		ipc.server.on('message', async (req: Request, socket) => {
			const {id} = req

			if(req.type === 'angular:compile') {
				const {sources} = await getWorker().compile(req.tsConfig, req.file)
				const response: AngularCompilationResponse = {id, type: req.type, sources}

				ipc.server.emit(socket, 'message', JSON.stringify(response))
			}
			else if(req.type === 'angular:vfs:read') {
				const contents = await getWorker().read(req.file)
				const response: NgVFSReadResponse = {
					id, contents,
					type: req.type
				}

				ipc.server.emit(socket, 'message', JSON.stringify(response))
			}
		})
		ipc.server.on('socket.disconnected', () => {
			if(angularWorker) {
				angularWorker.stop()
				angularWorker = null
				ipc.server.stop()

				process.exit(process.exitCode)
			}
		})
	})

	ipc.server.start()
}

let angularWorker: AngularWorker|null = null

function getWorker(): AngularWorker {
	if(angularWorker === null) {
		angularWorker = spawnAngularWorker()
	}

	return angularWorker
}
