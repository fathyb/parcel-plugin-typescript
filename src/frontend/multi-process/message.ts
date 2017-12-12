export type WithId<T = {}> = T &{id: number}

export namespace Angular {
	export interface CompilationRequest extends WithId {
		type: 'angular:compile'
		tsConfig: string
		file: string
	}
	export interface CompilationResponse extends WithId {
		type: 'angular:compile'
		sources: {
			js: string
			sourceMap?: string
		}
		resources: string[]
	}

	export interface VFSReadRequest extends WithId {
		type: 'angular:vfs:read'
		file: string
	}
	export interface VFSReadResponse extends WithId {
		type: 'angular:vfs:read'
		contents?: string
	}

	export interface VFSInvalidationRequest extends WithId {
		type: 'angular:vfs:invalidate'
		file: string
	}
	export interface VFSInvalidationResponse extends WithId {
		type: 'angular:vfs:invalidate'
	}

	export interface ResourceRequest extends WithId {
		type: 'angular:resource:get'
		file: string
	}
	export interface ResourceResponse extends WithId {
		type: 'angular:resource:get'
		content: string
	}

	export type Request =
		CompilationRequest | VFSReadRequest | VFSInvalidationRequest | ResourceRequest
	export type Response =
		CompilationResponse | VFSReadResponse | VFSInvalidationResponse | ResourceResponse
}

export namespace TypeScript {
	export interface CompilationRequest extends WithId {
		type: 'typescript:compile'
		tsConfig: string
		file: string
		for: 'angular'|'other'
	}
	export interface CompilationResponse extends WithId {
		type: 'typescript:compile'
		sources: {
			js: string
			sourceMap?: string
		}
	}

	export interface TypeCheckRequest extends WithId {
		type: 'typescript:type-check'
		tsConfig: string
		file: string
	}
	export interface TypeCheckResponse extends WithId {
		type: 'typescript:type-check'
	}

	export type Request = CompilationRequest | TypeCheckRequest
	export type Response = CompilationResponse | TypeCheckResponse
}
