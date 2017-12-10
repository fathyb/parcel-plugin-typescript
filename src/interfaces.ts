import {Diagnostic} from 'typescript'

export interface Message<T extends string, U extends {} = {}> {
	__parcelTypeScript: U & {
		type: T
	}
}

export type ReadyMessage = Message<'ready'>
export type CheckFileMessage = Message<'check-file', {
	file: string
}>

export type InjectedMessage = ReadyMessage | CheckFileMessage

export interface TranspilationResult {
	sources: {
		js: string
		sourceMap?: string
	}
}

export interface TypeCheckingResult {
	syntacticDiagnostics: Diagnostic[]
	semanticDiagnostics: Diagnostic[]

	transpile(): TranspilationResult
}
