import * as ts from 'typescript'

import {TypeCheckResult} from '../../interfaces'
import {formatDiagnostics, reportDiagnostics} from '../diagnostics'
import {LanguageServiceHost} from './host'

export class LanguageService {
	private readonly service: ts.LanguageService
	private readonly host: LanguageServiceHost

	constructor(config: ts.ParsedCommandLine) {
		this.host = new LanguageServiceHost(config)
		this.service = ts.createLanguageService(this.host, ts.createDocumentRegistry())
	}

	public check(path: string, reportErrors: boolean, root: string): TypeCheckResult {
		const {service} = this

		this.host.invalidate(path)

		const diagnostics = [
			...service.getSemanticDiagnostics(path),
			...service.getSyntacticDiagnostics(path)
		]
		const formatted = formatDiagnostics(diagnostics, root)

		if(reportErrors && diagnostics.length > 0) {
			reportDiagnostics(diagnostics, root)
		}

		return {
			diagnostics: diagnostics.length > 0
				? formatted
				: null
		}
	}
}
