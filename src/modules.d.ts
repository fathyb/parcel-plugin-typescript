declare module 'parcel-bundler/src/assets/JSAsset' {
	class JSAsset {
		public name: string
		public contents?: string

		constructor(name: string, pkg: string, options: any)

		parse(code: string): Promise<any>
	}

	export = JSAsset
}
declare module 'parcel-bundler/src/utils/config'
declare module 'parcel-bundler/src/utils/config'
declare module 'parcel-bundler/src/WorkerFarm'
declare module 'parcel-bundler/src/worker'

declare module 'normalize-path'
