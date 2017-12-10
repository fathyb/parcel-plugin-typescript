import {ChildProcess, fork} from 'child_process'

import WorkerFarm = require('parcel-bundler/src/WorkerFarm')

import {InjectedMessage} from '../../interfaces'
import {typeCheck} from '../process/checker'

/**
 * This function patch the WorkerFrame properties to interecpt
 * all messages sent from the workers.
 * When a file is updated a message will be sent to the master
 * and then dispatched to the type-checking worker.
 */
export function inject() {
	if(WorkerFarm.prototype.receive !== injectedReceive) {
		WorkerFarm.prototype.receive = injectedReceive
	}
}

// We create a proxy layer between the worker and the master
const injectedReceive = ((receive: () => void) =>
	function(this: any, data: InjectedMessage) {
		if(data && data.__parcelTypeScript) {
			receiveMessage(data, true)
		}
		else {
			return receive.call(this, data)
		}
	}
)(WorkerFarm.prototype.receive)

let forkedProcess: ChildProcess|null = null

export async function receiveMessage(data: InjectedMessage, fromWorker: boolean) {
	if(!data || !data.__parcelTypeScript) {
		throw new Error('Unknown Parcel TypeScript input message')
	}

	const {__parcelTypeScript: message} = data

	if(message.type === 'check-file') {
		// If we are in a worker (in watch mode)
		if(fromWorker) {
			if(forkedProcess === null) {
				forkedProcess = fork(require.resolve('../process'))
			}

			forkedProcess.send(message)
		}
		else {
			typeCheck(message.file)
		}
	}
	else {
		throw new Error(`Unknown Parcel TypeScript message "${message}"`)
	}
}
