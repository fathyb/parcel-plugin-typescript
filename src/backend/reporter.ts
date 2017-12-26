import {Diagnostic} from 'typescript'

import {formatDiagnostics} from './format'

export function reportDiagnostics(diagnostics: ReadonlyArray<Diagnostic>): void {
	if(diagnostics.length > 0 ) {
		const frame = formatDiagnostics(diagnostics, process.cwd())

		console.error(frame)
	}
}
