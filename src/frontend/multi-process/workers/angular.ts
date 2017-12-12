import {AngularCompiler} from '../../../backend/compiler/ngc'
import {FileStore} from '../../../backend/compiler/store'
import {loadConfiguration} from '../../../backend/config-loader'
import {Emitter} from '../../../utils/emitter'

import {Angular} from '../message'

const compilerCache = new Map<string, Promise<AngularCompiler>>()

async function requestHandler(data: Angular.Request) {
	const {id} = data

	if(data.type === 'angular:compile') {
		const {file, tsConfig} = data
		const compiler = await getCompiler(tsConfig)

		const {sources, resources} = await compiler.transpile(file)
		const response: Angular.Response = {id, type: data.type, sources, resources}

		sendResponse(response)
	}
	else if(data.type === 'angular:vfs:read') {
		const {file} = data
		const contents = FileStore.shared().readFile(file, true)
		const response: Angular.VFSReadResponse = {
			id, contents,
			type: data.type
		}

		sendResponse(response)
	}
	else if(data.type === 'angular:vfs:invalidate') {
		FileStore.shared().invalidate(data.file)

		sendResponse({
			id, type: data.type
		} as Angular.VFSInvalidationResponse)
	}
}

const messageEmitter = new Emitter<Angular.Response>()

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

let idCounter = 0
async function compileResource(file: string): Promise<string> {
	const id = idCounter++
	const type = 'angular:resource:get'
	const responsePromise = messageEmitter.once(message => message.id === id)

	process.send!({
		request: {id, file, type} as Angular.ResourceRequest
	})

	const response = await responsePromise

	if(response.type !== type) {
		throw new Error('invariant error')
	}

	return response.content
}

async function getCompiler(config: string): Promise<AngularCompiler> {
	let compiler = compilerCache.get(config)

	if(!compiler) {
		compiler = loadConfiguration(config).then(({path}) => new AngularCompiler(path, compileResource))

		compilerCache.set(config, compiler)
	}

	return compiler
}
