import {Request, Response} from '../../interfaces'
import {Handler} from '../../ipc'

import {TypeScriptCompiler} from '../compiler/tsc'
import {loadConfiguration} from '../config-loader'
import {LanguageService} from '../service/index'

const compilers = new Map<string, Promise<TypeScriptCompiler>>()
const services = new Map<string, Promise<LanguageService>>()

function getCompiler(file: string, rootDir: string): Promise<TypeScriptCompiler> {
	let compiler = compilers.get(rootDir)

	if(!compiler) {
		compiler = loadConfiguration(file, rootDir).then(config =>
			new TypeScriptCompiler(config)
		)

		compilers.set(rootDir, compiler)
	}

	return compiler
}

function getService(file: string, rootDir: string): Promise<LanguageService> {
	let service = services.get(rootDir)

	if(!service) {
		service = loadConfiguration(file, rootDir).then(({typescript}) =>
			new LanguageService(typescript)
		)

		services.set(rootDir, service)
	}

	return service
}

const handler: Handler<Request, Response> = {
	async compile({file, reportErrors, rootDir}) {
		const compiler = await getCompiler(file, rootDir)

		return compiler.compile(file, reportErrors, rootDir)
	},
	async typeCheck({file, reportErrors, rootDir}) {
		const service = await getService(file, rootDir)

		return service.check(file, reportErrors, rootDir)
	}
}

export = handler
