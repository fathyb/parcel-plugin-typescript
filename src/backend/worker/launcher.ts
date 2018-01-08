import {Request, Response} from '../../interfaces'
import {Handler} from '../../ipc'

import {TypeScriptCompiler} from '../compiler/tsc'
import {loadConfiguration} from '../config-loader'
import {LanguageService} from '../service/index'

const compilers = new Map<string, Promise<TypeScriptCompiler>>()
const services = new Map<string, Promise<LanguageService>>()

function getCompiler(tsConfig: string): Promise<TypeScriptCompiler> {
	let compiler = compilers.get(tsConfig)

	if(!compiler) {
		compiler = loadConfiguration(tsConfig).then(config => new TypeScriptCompiler(config))

		compilers.set(tsConfig, compiler)
	}

	return compiler
}

function getService(tsConfig: string): Promise<LanguageService> {
	let service = services.get(tsConfig)

	if(!service) {
		service = loadConfiguration(tsConfig).then(config => new LanguageService(config))

		services.set(tsConfig, service)
	}

	return service
}

const handler: Handler<Request, Response> = {
	async compile({file, reportErrors, tsConfig}) {
		const compiler = await getCompiler(tsConfig)

		return compiler.compile(file, reportErrors)
	},
	async typeCheck({file, reportErrors, tsConfig}) {
		const service = await getService(tsConfig)

		return service.check(file, reportErrors)
	}
}

export = handler
