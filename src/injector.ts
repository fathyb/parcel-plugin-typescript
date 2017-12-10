import WorkerFarm = require('parcel-bundler/src/WorkerFarm')

import {InjectedMessage, ReadyMessage} from './interfaces'

export function injectIntoWorker() {
	if(process.send) {
		process.send!({
			__parcelTypeScript: {
				type: 'ready'
			}
		} as ReadyMessage)
	}
}

export function injectIntoMaster() {
	const {receive} = WorkerFarm.prototype

	WorkerFarm.prototype.receive = function(this: any, data: InjectedMessage) {
		if(data && data.__parcelTypeScript) {
			const {__parcelTypeScript: message} = data

			if(message.type === 'ready') {
				// console.log('\nWorker is ready\n')
			}
		}
		else {
			receive.call(this, data)
		}
	}
}
