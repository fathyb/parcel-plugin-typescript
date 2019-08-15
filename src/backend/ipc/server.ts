import {Server as HTTPServer} from 'http'

import bodyParser = require('body-parser')
import express = require('express')

import {setSocketPath} from './dynamic'
import {getHandlerMethods, Handler, Keys} from './handler'

export class Server<RQ, RS, K extends Keys<RQ, RS> = Keys<RQ, RS>> {
	private readonly app = express()
	private readonly server: HTTPServer

	constructor(name: string, handler: Handler<RQ, RS>) {
		const app = this.app.use(bodyParser.json({limit: '10mb'}))

		getHandlerMethods(handler).forEach(method =>
			app.post(`/${method}`, async (req, res) => {
				try {
					const result = await handler[method as any as K](req.body.data)

					res.json({result})
				}
				catch(error) {
					const message = error && (error.stack || error.message || error)

					res.json({
						error: typeof message === 'string' ? message : 'Unknown error'
					})

					return
				}
			})
		)

		this.server = app
			.listen(setSocketPath(name))
			.on('error', err => console.error(err))
	}

	public close() {
		this.server.close()
	}
}
