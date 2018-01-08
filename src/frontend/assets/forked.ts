import {IPCClient} from '../../backend/worker/client'
import {MakeTranspileAsset} from './classes/transpile'

export = function(name: string, pkg: string, options: any): any {
	return new (class extends MakeTranspileAsset(name, pkg, options) {
		public async transpile(code: string) {
			const config = await this.config
			const reportErrors = !config.options.noEmitOnError
			const checkPromise = IPCClient.typeCheck({
				file: this.name, tsConfig: config.path,
				reportErrors
			})

			if(!reportErrors) {
				const {diagnostics} = await checkPromise

				if(diagnostics) {
					console.error(diagnostics)

					// tslint:disable:no-string-throw
					throw 'TypeScript errors were found while compiling'
				}
			}

			return super.transpile(code)
		}
	})()
}
