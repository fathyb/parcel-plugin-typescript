import {EOL} from 'os'

import {codeFrameColumns, Location} from '@babel/code-frame'

import chalk from 'chalk'
import normalizePath = require('normalize-path')
import * as ts from 'typescript'

export function formatDiagnostics(diagnostics: ReadonlyArray<ts.Diagnostic>, context: string): string {
	return diagnostics.map(diagnostic => {
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
	}).join(EOL) + EOL
}

function formatDiagnosticMessage(diagnostic: string|ts.DiagnosticMessageChain, delimiter: string, context: string) {
	const contextPath = normalizePath(context)

	return ts
		.flattenDiagnosticMessageText(diagnostic, delimiter)
		.replace(new RegExp(contextPath, 'g'), '.')
}
