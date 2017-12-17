import ipc = require('node-ipc')

import {AngularWorker, spawnAngularWorker} from '../controllers/angular'
import {AngularCompilationResponse, NgVFSReadResponse, Request} from '../message'

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
			try {
				const {id} = req

				if(req.type === 'angular:compile') {
					const {sources, resources} = await getWorker(bundler).compile(req.tsConfig, req.file)
					const response: AngularCompilationResponse = {id, type: req.type, sources, resources}

					ipc.server.emit(socket, 'message', JSON.stringify(response))
				}
				else if(req.type === 'angular:vfs:read') {
					const contents = await getWorker(bundler).read(req.file)
					const response: NgVFSReadResponse = {
						id, contents,
						type: req.type
					}

					ipc.server.emit(socket, 'message', JSON.stringify(response))
				}
			}
			catch(err) {
				console.error(err)
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

function getWorker(bundler: any): AngularWorker {
	if(angularWorker === null) {
		angularWorker = spawnAngularWorker(bundler)
	}

	return angularWorker
}
