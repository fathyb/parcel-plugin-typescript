// This is directly copy-pasted from https://github.com/zinserjan/ts-diagnostic-formatter
// The original code need throws errors because of es6-error

import {EOL} from 'os'

import codeFrame = require('babel-code-frame')
import chalk from 'chalk'
import normalizePath = require('normalize-path')
import {Diagnostic, flattenDiagnosticMessageText} from 'typescript'

export function formatDiagnostic(diagnostics: Diagnostic[], context: string): string {
	return diagnostics.map(diagnostic => {
		const messageText = formatDiagnosticMessage(diagnostic, '', context)
		let message = messageText

		if(diagnostic.file != null && diagnostic.start != null) {
			const lineChar = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
			const source = diagnostic.file.text || diagnostic.source

			const messages = [chalk.dim(` ${lineChar.line + 1}:${lineChar.character + 1}  `) + messageText]

			if(source != null) {
				const frame = codeFrame(
					source,
					lineChar.line + 1,
					lineChar.character,
					{linesAbove: 1, linesBelow: 1, highlightCode: true}
				)
					.split('\n')
					.map(str => `  ${str}`)
					.join('\n')
				messages.push(frame)
			}
			message = messages.join('\n')
		}
		return message + EOL
	}).join(EOL) + EOL
}

function replaceAbsolutePaths(message: string, context: string) {
	const contextPath = normalizePath(context)

	return message.replace(new RegExp(contextPath, 'g'), '.')
}

function formatDiagnosticMessage(diagnostic: Diagnostic, delimiter: string, context: string) {
	return replaceAbsolutePaths(flattenDiagnosticMessageText(diagnostic.messageText, delimiter), context)
}
