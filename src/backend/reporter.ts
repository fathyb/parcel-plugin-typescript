import {TypeCheckingResult} from '../interfaces'
import {formatDiagnostic} from './format'

export function reportDiagnostics(
	{semanticDiagnostics, syntacticDiagnostics}: TypeCheckingResult
): void {
	const frame = formatDiagnostic(syntacticDiagnostics.concat(semanticDiagnostics), process.cwd())

	console.error(frame)
}
