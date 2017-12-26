import {Request, Response} from '../../interfaces'
import {Client} from '../../ipc'

// This is when I dream about type introspection
export const IPCClient = Client<Request, Response>('typescript', [
	'compile', 'typeCheck'
])
