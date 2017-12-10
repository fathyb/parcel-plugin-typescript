import config = require('parcel-bundler/src/utils/config')

export class ConfigurationLoader<T> {
	private readonly promise: Promise<T>

	constructor(path: string, then: (config: any) => T) {
		const configLoad: Promise<any> = config.load(path, ['tsconfig.json'])

		this.promise = configLoad.then(tsconfig => {
			const transpilerOptions = {
				compilerOptions: {
					module: 'commonjs',
					jsx: 'preserve'
				}
			} as any

			// Overwrite default if config is found
			if(tsconfig) {
				transpilerOptions.compilerOptions = tsconfig.compilerOptions
				transpilerOptions.files = tsconfig.files
				transpilerOptions.include = tsconfig.include
				transpilerOptions.exclude = tsconfig.exclude
			}

			transpilerOptions.compilerOptions.noEmit = false

			return then(transpilerOptions)
		})
	}

	public wait(): Promise<T> {
		return this.promise
	}
}
