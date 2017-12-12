import {fork} from 'child_process'

import {TranspileResult} from '../interfaces'
import {NgVFSInvalidationRequest, NgVFSReadRequest, Request, Response} from './message'

let ID_COUNTER = 0

export interface AngularWorker {
	compile(tsConfig: string, file: string): Promise<TranspileResult>
	read(file: string): Promise<string>
	invalidate(file: string): Promise<void>
	stop(): void
}

export function spawnAngularWorker(): AngularWorker {
	const worker = fork(require.resolve('./workers/angular'))
	const listeners = new Map<number, (r: Response) => void>()

	worker.on('message', (message: Response) => {
		const {id} = message
		const listener = listeners.get(id)

		if(!listener) {
			return console.error('no listener found for angular worker')
		}

		listener(message)
	})

	return {
		read(file: string): Promise<string> {
			return new Promise<string>(resolve => {
				const id = ID_COUNTER++
				const type = 'angular:vfs:read'
				const request: NgVFSReadRequest = {id, type, file}

				listeners.set(id, message => {
					listeners.delete(id)

					if(message.type !== type) {
						throw new Error('Unknown worker message')
					}

					resolve(message.contents)
				})

				worker.send(request)
			})
		},
		compile(tsConfig: string, file: string): Promise<TranspileResult> {
			return new Promise<TranspileResult>(resolve => {
				const id = ID_COUNTER++
				const type = 'angular:compile'
				const request: Request = {id, type, tsConfig, file}

				listeners.set(id, message => {
					listeners.delete(id)

					if(message.type !== 'angular:compile') {
						throw new Error('Unknown worker message')
					}

					const {sources} = message

					resolve({sources})
				})

				worker.send(request)
			})
		},
		stop() {
			worker.kill()
		},
		invalidate(file: string): Promise<void> {
			return new Promise<void>(resolve => {
				const id = ID_COUNTER++
				const type = 'angular:vfs:invalidate'
				const request: NgVFSInvalidationRequest = {id, type, file}

				listeners.set(id, message => {
					listeners.delete(id)

					if(message.type !== type) {
						throw new Error('Unknown worker message')
					}

					resolve()
				})

				worker.send(request)
			})
		}
	}
}
