import {loadConfiguration} from '../../../backend/config-loader'
import {LanguageService} from '../../../backend/service'

import {TypeScript} from '../message'

const serviceCache = new Map<string, Promise<LanguageService>>()

async function requestHandler(data: TypeScript.Request) {
	const {id} = data

	if(data.type === 'typescript:type-check') {
		const {file, tsConfig} = data
		const service = await getService(tsConfig)

		service.check(file)

		const response: TypeScript.Response = {id, type: data.type}

		sendResponse(response)
	}
}

process.on('message', (data: any) => {
	if(data.request) {
		requestHandler(data.request).catch(err => {
			console.error(err)
		})
	}
})

function sendResponse(response: {}) {
	process.send!({response})
}

async function getService(config: string): Promise<LanguageService> {
	let compiler = serviceCache.get(config)

	if(!compiler) {
		compiler = loadConfiguration(config).then(configuration => new LanguageService(configuration))

		serviceCache.set(config, compiler)
	}

	return compiler
}
