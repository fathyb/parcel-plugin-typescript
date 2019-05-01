import {RequestMessage, ResponseMessage} from '.'

const filePath = process.argv[2]
// tslint:disable-next-line:no-var-requires
const handler = require(filePath)

process.on('message', async (message: RequestMessage<{}>) => {
	const {id, method} = message

	try {
		const result = await handler[message.method](message.data)
		const response: ResponseMessage<{}> = {
			// don't quite understand how this type signature is supposed to
			// work (I think it's impossible to satisfy), so just cast to any.
			id, method, type: 'response', data: {result, error: null} as any
		}

		process.send!(response)
	}
	catch(err) {
		const error = err ? (err.stack || err.message || err) : 'Unknown error'
		const response: ResponseMessage<{}> = {
			id, method, type: 'response', data: {error, result: null}
		}

		process.send!(response)
	}
})
