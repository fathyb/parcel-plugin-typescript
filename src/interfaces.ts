import {Diagnostic} from 'typescript'

export type Message<T extends string, U extends {} = {}> = U & {
	type: T
}

export type CheckFileMessage = Message<'check-file', {
	file: string
}>
export type AngularCompilerMessage = Message<'angular:compile', {
	file: string
	tsConfig: string
}>

export interface InjectedMessage {
	__parcelTypeScript: CheckFileMessage | AngularCompilerMessage
}

export interface TranspileResult {
	sources: {
		js: string
		sourceMap?: string
	}
}

export interface TypeCheckResult {
	syntacticDiagnostics: Diagnostic[]
	semanticDiagnostics: Diagnostic[]

	transpile(): TranspileResult
}
