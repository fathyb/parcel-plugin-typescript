import {CheckFileMessage, InjectedMessage, ReadyMessage} from '../interfaces'

import {receiveMessage} from './master'

export function inject() {
	dispatchMessage({
		__parcelTypeScript: {
			type: 'ready'
		}
	} as ReadyMessage)
}

export function dispatchCheckFile(file: string) {
	dispatchMessage({
		__parcelTypeScript: {
			type: 'check-file',
			file
		}
	} as CheckFileMessage)
}

function dispatchMessage(message: InjectedMessage) {
	if(process.send) {
		process.send(message)
	}
	else {
		receiveMessage(message)
	}
}
