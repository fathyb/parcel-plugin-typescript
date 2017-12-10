import {InjectedMessage} from '../../interfaces'

import {receiveMessage} from './master'

export function dispatchCheckFile(file: string) {
	dispatchMessage({
		__parcelTypeScript: {
			type: 'check-file',
			file
		}
	})
}

function dispatchMessage(message: InjectedMessage) {
	// if process.send is defined then we are in a worker
	if(process.send) {
		process.send(message)
	}
	// else we are in the main thread
	// this may happen on the first build
	else {
		receiveMessage(message, false)
	}
}
