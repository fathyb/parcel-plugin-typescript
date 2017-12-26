import {ChildProcess, fork} from 'child_process'

import {Emitter} from '../../utils/emitter'
import {Keys} from '../handler'

export interface RequestMessage<R, K extends keyof R = keyof R> {
	type: 'request'
	id: string
	method: K
	data: R[K]
}

export interface ResponseMessage<R, K extends keyof R = keyof R> {
	type: 'response'
	id: string
	method: K
	data: {
		result: R[K]
		error: null
	} | {
		result: null
		error: string
	}
}

type Message<RQ, RS, K extends Keys<RQ, RS> = Keys<RQ, RS>> = RequestMessage<RQ, K> | ResponseMessage<RS, K>

export class Worker<RQ = {}, RS = {}, K extends Keys<RQ, RS> = Keys<RQ, RS>> {
	private readonly onMessage = new Emitter<Message<RQ, RS>>()
	private readonly child: ChildProcess

	constructor(path: string) {
		this.child = fork(require.resolve('./launcher'), [path], {
			env: process.env
		})

		this.child.on('message', message => this.onMessage.emit(message))
	}

	public async request<M extends K>(method: M, data: RQ[M]): Promise<RS[M]> {
		const id = Math.random().toString(36)
		const promise = this.onMessage.once(({type, id: messageId}) => type === 'response' && messageId === id)
		const message: RequestMessage<RQ, M> = {id, method, data, type: 'request'}

		this.child.send(message)

		const result = await promise

		if(result.method !== method || result.type !== 'response') {
			throw new Error(`invariant error, received "${result.method}" response, expected "${method}"`)
		}

		if(result.data.error === null && result.data.result !== null) {
			return result.data.result
		}

		throw new Error(result.data.error || 'Unknown error')
	}

	public kill(): void {
		this.child.kill()
	}
}
