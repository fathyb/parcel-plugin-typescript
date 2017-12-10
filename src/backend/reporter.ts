import chalk from 'chalk'

import {TypeCheckingResult} from '../interfaces'
import {formatDiagnostic} from './format'

export function reportDiagnostics(
	file: string,
	{semanticDiagnostics, syntacticDiagnostics}: TypeCheckingResult
): void {
	// TODO: properly log this
	if(syntacticDiagnostics.length > 0) {
		const frame = formatDiagnostic(syntacticDiagnostics, process.cwd())

		throw new Error(frame)
	}

	if(semanticDiagnostics.length > 0) {
		const codeFrame = formatDiagnostic(semanticDiagnostics, process.cwd())

		console.error('🚨 %s: \n%s', chalk.redBright(file), codeFrame)
	}
}
