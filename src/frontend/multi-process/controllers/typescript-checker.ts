import {fork} from 'child_process'

import {TypeScript} from '../message'

let ID_COUNTER = 0

export interface TypeScriptCheckerWorker {
	typeCheck(tsConfig: string, file: string): Promise<void>
	stop(): void
}

export function spawnTypeScriptCheckerWorker(): TypeScriptCheckerWorker {
	const worker = fork(require.resolve('../workers/typescript-checker'))
	const listeners = new Map<number, (r: TypeScript.Response) => void>()

	worker.on('message', async (data: any) => {
		const response = data.response as TypeScript.Response

		if(response) {
			const {id} = response
			const listener = listeners.get(id)

			if(!listener) {
				return console.error('no listener found for typescript worker')
			}

			listener(response)
		}
	})

	return {
		typeCheck(tsConfig: string, file: string): Promise<void> {
			return new Promise<void>(resolve => {
				const id = ID_COUNTER++
				const type = 'typescript:type-check'
				const request: TypeScript.Request = {id, type, tsConfig, file}

				listeners.set(id, message => {
					listeners.delete(id)

					if(message.type !== type) {
						throw new Error('Unknown worker message')
					}

					resolve()
				})

				worker.send({request})
			})
		},
		stop() {
			worker.kill()
		}
	}
}
