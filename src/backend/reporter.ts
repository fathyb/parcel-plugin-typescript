import {TypeCheckResult} from '../interfaces'
import {formatDiagnostic} from './format'

export function reportDiagnostics(
	{semanticDiagnostics, syntacticDiagnostics}: TypeCheckResult
): void {
	const diagnostics = syntacticDiagnostics.concat(semanticDiagnostics)

	if(diagnostics.length > 0 ) {
		const frame = formatDiagnostic(diagnostics, process.cwd())

		console.error(frame)
	}
}
