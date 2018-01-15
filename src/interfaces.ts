export interface TypeCheckResult {
	// Preformatted to prevent circular references errors
	diagnostics: null|string
}

export interface CompileResult extends TypeCheckResult {
	sources: {
		js: string
		sourceMap?: string
	}
	dependencies: null|Array<{
		source: string
		position: number
	}>
}

export interface CompileRequest {
	file: string
	reportErrors: boolean
	rootDir: string
}

export interface Request {
	typeCheck: CompileRequest
	compile: CompileRequest
}

export interface Response {
	typeCheck: TypeCheckResult
	compile: CompileResult & TypeCheckResult
}
