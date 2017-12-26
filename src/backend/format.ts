// This is directly copy-pasted from https://github.com/zinserjan/ts-diagnostic-formatter
// The original code throws errors because of es6-error

import {EOL} from 'os'

import {codeFrameColumns, Location} from '@babel/code-frame'

import chalk from 'chalk'
import normalizePath = require('normalize-path')
import * as ts from 'typescript'

export function formatDiagnostics(diagnostics: ReadonlyArray<ts.Diagnostic>, context: string): string {
	return diagnostics.map(diagnostic => formatTypeScriptDiagnostic(diagnostic as ts.Diagnostic, context)).join(EOL) + EOL
}

function formatTypeScriptDiagnostic(diagnostic: ts.Diagnostic, context: string) {
	const messageText = formatDiagnosticMessage(diagnostic.messageText, '', context)
	const {file} = diagnostic
	let message = messageText

	if(file != null && diagnostic.start != null) {
		const lineChar = file.getLineAndCharacterOfPosition(diagnostic.start)
		const source = file.text || diagnostic.source
		const start = {
			line: lineChar.line + 1,
			column: lineChar.character + 1
		}
		const location: Location = {start}
		const red = chalk.red(`🚨  ${file.fileName}(${start.line},${start.column})`)

		const messages = [`${red}\n${chalk.redBright(messageText)}`]

		if(source != null) {
			if(typeof diagnostic.length === 'number') {
				const end = file.getLineAndCharacterOfPosition(diagnostic.start + diagnostic.length)

				location.end = {
					line: end.line + 1,
					column: end.character + 1
				}
			}

			const frame = codeFrameColumns(source, location, {
				linesAbove: 1,
				linesBelow: 1,
				highlightCode: true
			})

			messages.push(
				frame
					.split('\n')
					.map(str => `  ${str}`)
					.join('\n')
			)
		}

		message = messages.join('\n')
	}

	return message + EOL
}

function replaceAbsolutePaths(message: string, context: string) {
	const contextPath = normalizePath(context)

	return message.replace(new RegExp(contextPath, 'g'), '.')
}

function formatDiagnosticMessage(diagnostic: string|ts.DiagnosticMessageChain, delimiter: string, context: string) {
	return replaceAbsolutePaths(ts.flattenDiagnosticMessageText(diagnostic, delimiter), context)
}
