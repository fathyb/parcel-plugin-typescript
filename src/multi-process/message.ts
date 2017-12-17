export type WithId<T = {}> = T &{id: number}

export interface AngularCompilationRequest extends WithId {
	type: 'angular:compile'
	tsConfig: string
	file: string
}

export interface AngularCompilationResponse extends WithId {
	type: 'angular:compile'
	sources: {
		js: string
		sourceMap?: string
	}
	resources: string[]
}

export interface NgVFSReadRequest extends WithId {
	type: 'angular:vfs:read'
	file: string
}

export interface NgVFSReadResponse extends WithId {
	type: 'angular:vfs:read'
	contents?: string
}

export interface NgVFSInvalidationRequest extends WithId {
	type: 'angular:vfs:invalidate'
	file: string
}

export interface NgVFSInvalidationResponse extends WithId {
	type: 'angular:vfs:invalidate'
}

export interface NgResourceRequest extends WithId {
	type: 'angular:resource:get'
	file: string
}

export interface NgResourceResponse extends WithId {
	type: 'angular:resource:get'
	content: string
}

export type Request =
	AngularCompilationRequest | NgVFSReadRequest | NgVFSInvalidationRequest | NgResourceRequest

export type Response =
	AngularCompilationResponse | NgVFSReadResponse | NgVFSInvalidationResponse | NgResourceResponse
