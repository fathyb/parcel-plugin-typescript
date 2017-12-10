import * as ts from 'typescript'

import {LanguageServiceHost} from './host'

import {TypeCheckingResult} from '../interfaces'

export class LanguageService {
	private readonly service: ts.LanguageService

	constructor(json: any) {
		const host = new LanguageServiceHost(json)

		this.service = ts.createLanguageService(host, ts.createDocumentRegistry())
	}

	public parse(path: string): TypeCheckingResult {
		const {service} = this

		return {
			syntacticDiagnostics: service.getSyntacticDiagnostics(path),
			semanticDiagnostics: service.getSemanticDiagnostics(path),

			transpile() {
				const {outputFiles} = service.getEmitOutput(path)

				const jsFile = outputFiles.find(({name}) => /\.jsx?$/.test(name))

				if(!jsFile) {
					throw new Error('TypeScript did not produce any output')
				}

				const sourceMap = outputFiles.find(({name}) => /\.js\.map$/.test(name))

				return {
					sources: {
						js: jsFile.text,
						sourceMap: sourceMap && sourceMap.text
					}
				}
			}
		}
	}
}
