import {fork} from 'child_process'

import {TranspileResult} from '../../../interfaces'

import {TypeScript} from '../message'

let ID_COUNTER = 0

export interface TypeScriptCompilerWorker {
	compile(tsConfig: string, file: string, forPlatform: 'angular'|'other'): Promise<TranspileResult>
	stop(): void
}

export function spawnTypeScriptCompilerWorker(): TypeScriptCompilerWorker {
	const worker = fork(require.resolve('../workers/typescript-compiler'))
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
		compile(tsConfig: string, file: string, forPlatform: 'angular'|'other'): Promise<TranspileResult> {
			return new Promise<TranspileResult>(resolve => {
				const id = ID_COUNTER++
				const type = 'typescript:compile'
				const request: TypeScript.Request = {id, type, tsConfig, file, for: forPlatform}

				listeners.set(id, message => {
					listeners.delete(id)

					if(message.type !== type) {
						throw new Error('Unknown worker message')
					}

					const {sources} = message

					resolve({sources})
				})

				worker.send({request})
			})
		},
		stop() {
			worker.kill()
		}
	}
}
