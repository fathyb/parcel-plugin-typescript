declare module 'parcel-bundler/src/assets/JSAsset' {
	class JSAsset {
		public name: string
		public contents?: string
		public options?: any

		constructor(name: string, pkg: string, options: any)

		parse(code: string): Promise<any>
	}

	export = JSAsset
}
declare module 'parcel-bundler/src/utils/config'
declare module 'parcel-bundler/src/utils/config'
declare module 'parcel-bundler/src/WorkerFarm'
declare module 'parcel-bundler/src/worker'
declare module 'enhanced-resolve/lib/getInnerRequest' {
	interface Request {
		request?: Request;
		relativePath: string;
	}

	type ResolverCallback = (request: Request, callback: Callback) => void

	interface Callback {
		(err?: Error, result?: any): void;

		log?: any;
		stack?: any;
		missing?: any;
	}

	interface Resolver {
		plugin(source: string, cb: ResolverCallback): void
		doResolve(target: string, req: Request, desc: string, callback: Callback): void
		join(relativePath: string, innerRequest: Request): Request;
	}

	function getInnerRequest(resolver: Resolver, request: Request): string

	export = getInnerRequest
}

declare module 'normalize-path'

declare module '@babel/code-frame' {
	export interface LineAndColumn {
		line: number
		column: number
	}

	export interface Location {
		start: LineAndColumn
		end?: LineAndColumn
	}

	export type Options = Partial<{
		highlightCode: boolean
		linesAbove: number
		linesBelow: number
		forceColor: boolean
	}>

	export function codeFrameColumns(lines: string, location: Location, options?: Options): string
}
