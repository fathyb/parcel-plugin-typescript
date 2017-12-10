import {CheckFileMessage} from '../../interfaces'
import {Batcher} from '../../utils/batcher'

import {typeCheck} from './checker'

// The batcher will batch all check queries each 50 milliseconds.
const batcher = new Batcher<CheckFileMessage>(messages => typeCheck(...messages.map(({file}) => file)), 50)

process.on('message', (message: CheckFileMessage) => batcher.emit(message))
