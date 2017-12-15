import {fork} from 'child_process'

import {getFileResources, processHTMLResource} from '../../frontend/loaders/html'
import {TranspileResult} from '../../interfaces'
import {readFile} from '../../utils/fs'

import {
	NgResourceResponse, NgVFSInvalidationRequest, NgVFSReadRequest, Request, Response
} from '../message'

let ID_COUNTER = 0

export interface AngularWorker {
	compile(tsConfig: string, file: string): Promise<TranspileResult & {resources: string[]}>
	read(file: string): Promise<string>
	invalidate(file: string): Promise<void>
	stop(): void
}

export function spawnAngularWorker(bundler: any): AngularWorker {
	const worker = fork(require.resolve('../workers/angular'))
	const listeners = new Map<number, (r: Response) => void>()

	worker.on('message', async (data: any) => {
		const response = data.response as Response
		const request = data.request as Request

		if(response) {
			const {id} = response
			const listener = listeners.get(id)

			if(!listener) {
				return console.error('no listener found for angular worker')
			}

			listener(response)
		}
		else if(request) {
			const {id} = request

			try {
				if(request.type === 'angular:resource:get') {
					const source = await readFile(request.file)
					const content = await processHTMLResource(request.file, source, bundler)

					worker.send({
						response: {
							type: request.type,
							id, content
						} as NgResourceResponse
					})
				}
			}
			catch(err) {
				console.error(err)
			}
		}
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

				worker.send({request})
			})
		},
		compile(tsConfig: string, file: string): Promise<TranspileResult & {resources: string[]}> {
			return new Promise<TranspileResult & {resources: string[]}>(resolve => {
				const id = ID_COUNTER++
				const type = 'angular:compile'
				const request: Request = {id, type, tsConfig, file}

				listeners.set(id, message => {
					listeners.delete(id)

					if(message.type !== 'angular:compile') {
						throw new Error('Unknown worker message')
					}

					const {sources} = message
					const resources = message.resources
						.map(resource => getFileResources(resource))
						.reduce((a, b) => a.concat(b), [])

					resolve({sources, resources})
				})

				worker.send({request})
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

				worker.send({request})
			})
		}
	}
}
