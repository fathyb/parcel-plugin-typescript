import {Diagnostic} from 'typescript'

import {formatDiagnostics} from './format'

export function reportDiagnostics(diagnostics: ReadonlyArray<Diagnostic>, context: string): void {
	if(diagnostics.length > 0 ) {
		const frame = formatDiagnostics(diagnostics, context)

		console.error(frame)
	}
}
