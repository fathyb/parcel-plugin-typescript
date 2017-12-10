import * as ts from 'typescript'

import {LanguageServiceHost} from './host'

import {TypeCheckResult} from '../../interfaces'

export class LanguageService {
	private readonly service: ts.LanguageService
	private readonly host: LanguageServiceHost

	constructor(json: any) {
		this.host = new LanguageServiceHost(json)
		this.service = ts.createLanguageService(this.host, ts.createDocumentRegistry())
	}

	public parse(path: string): TypeCheckResult {
		const {service} = this

		this.host.invalidate(path)

		return {
			syntacticDiagnostics: service.getSyntacticDiagnostics(path),
			semanticDiagnostics: service.getSemanticDiagnostics(path),

			transpile() {
				const {outputFiles} = service.getEmitOutput(path)

				const jsFile = outputFiles.find(({name}) => /\.jsx?$/.test(name))

				if(!jsFile) {
					throw new Error('TypeScript did not produce any output')
				}

				const sourceMap = outputFiles
					.filter(({name}) => /\.js\.map$/.test(name))
					.map(({text}) => text)
					.pop()

				return {
					sources: {
						js: jsFile.text,
						sourceMap
					}
				}
			}
		}
	}
}
