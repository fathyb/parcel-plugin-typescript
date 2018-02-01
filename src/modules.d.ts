declare module 'parcel-bundler/lib/assets/JSAsset' {
	class JSAsset {
		public name: string
		public relativeName: string
		public contents?: string
		public sourceMap?: any
		public options?: any
		public package?: any
		public dependencies: Map<string, string>
		public depAssets: Map<string, any>

		protected isES6Module: boolean

		constructor(name: string, pkg: string, options: any)

		parse(code: string): Promise<any>
		load(): Promise<string>
		addURLDependency(url: string, from?: string, opts?: {}): string
		addDependency(url: string, opts: {}): string
		collectDependencies(): void
		transform(): Promise<void>
		pretransform(): Promise<void>
	}

	export = JSAsset
}
declare module 'parcel-bundler/src/assets/JSAsset' {
	import JSAsset = require('parcel-bundler/lib/assets/JSAsset')

	export = JSAsset
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
