import {TypeScriptCompiler} from '../../../backend/compiler/tsc'
import {loadConfiguration} from '../../../backend/config-loader'
import {Emitter} from '../../../utils/emitter'

import {TypeScript} from '../message'

const compilerCache = new Map<string, Promise<TypeScriptCompiler>>()

async function requestHandler(data: TypeScript.Request) {
	const {id} = data

	if(data.type === 'typescript:compile') {
		const {file, tsConfig} = data
		const compiler = await getCompiler(tsConfig)
		const {sources} = await compiler.compile(file)
		const response: TypeScript.Response = {id, type: data.type, sources}

		sendResponse(response)
	}
}

const messageEmitter = new Emitter<TypeScript.Response>()

process.on('message', (data: any) => {
	if(data.request) {
		requestHandler(data.request).catch(err => {
			console.error(err)
		})
	}
	else if(data.response) {
		messageEmitter.emit(data.response)
	}
})

function sendResponse(response: {}) {
	process.send!({response})
}

async function getCompiler(config: string): Promise<TypeScriptCompiler> {
	let compiler = compilerCache.get(config)

	if(!compiler) {
		compiler = loadConfiguration(config).then(configuration => new TypeScriptCompiler(configuration))

		compilerCache.set(config, compiler)
	}

	return compiler
}
