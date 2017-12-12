import * as ts from 'typescript'

import {reportDiagnostics} from '../reporter'
import {LanguageServiceHost} from './host'

export class LanguageService {
	private readonly service: ts.LanguageService
	private readonly host: LanguageServiceHost

	constructor(config: ts.ParsedCommandLine) {
		this.host = new LanguageServiceHost(config)
		this.service = ts.createLanguageService(this.host, ts.createDocumentRegistry())
	}

	public check(path: string): void {
		const {service} = this

		this.host.invalidate(path)

		const diagnostics = [...service.getSemanticDiagnostics(path), ...service.getSyntacticDiagnostics(path)]

		reportDiagnostics(diagnostics)
	}
}
