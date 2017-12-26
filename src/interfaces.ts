import {Diagnostic} from 'typescript'

export interface CompileResult {
	sources: {
		js: string
		sourceMap?: string
	}
}

export interface TypeCheckResult {
	syntacticDiagnostics: Diagnostic[]
	semanticDiagnostics: Diagnostic[]
}

export interface CompileRequest {
	file: string
	tsConfig: string
}

export interface Request {
	typeCheck: CompileRequest
	compile: CompileRequest
}

export interface Response {
	typeCheck: void
	compile: CompileResult
}
