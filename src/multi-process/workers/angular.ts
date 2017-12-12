import {AngularCompiler} from '../../backend/compiler/angular'
import {FileStore} from '../../backend/compiler/store'
import {ConfigurationLoader} from '../../backend/config-loader'
import {NgVFSInvalidationResponse, NgVFSReadResponse, Request, Response} from '../message'

const compilerCache = new Map<string, AngularCompiler>()

process.on('message', async (data: Request) => {
	const {id} = data

	if(data.type === 'angular:compile') {
		const {file, tsConfig} = data
		let compiler = compilerCache.get(tsConfig)

		if(!compiler) {
			compiler = await new ConfigurationLoader(
				tsConfig, config => new AngularCompiler(config.path)
			).wait()

			compilerCache.set(tsConfig, compiler)
		}

		const {sources} = await compiler.transpile('', file)
		const response: Response = {id, type: data.type, sources}

		process.send!(response)
	}
	else if(data.type === 'angular:vfs:read') {
		const {file} = data
		const contents = FileStore.shared().readFile(file, true)
		const response: NgVFSReadResponse = {
			id, contents,
			type: data.type
		}

		process.send!(response)
	}
	else if(data.type === 'angular:vfs:invalidate') {
		FileStore.shared().invalidate(data.file)

		process.send!({
			id, type: data.type
		} as NgVFSInvalidationResponse)
	}
})
