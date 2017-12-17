import {Diagnostic as AngularDiagnostic} from '@angular/compiler-cli/src/transformers/api'
import {Diagnostic as TypeScriptDiagnostic} from 'typescript'

import {formatDiagnostics} from './format'

export type Diagnostic = AngularDiagnostic | TypeScriptDiagnostic

export function reportDiagnostics(diagnostics: Diagnostic[]): void {
	if(diagnostics.length > 0 ) {
		const frame = formatDiagnostics(diagnostics, process.cwd())

		console.error(frame)
	}
}
