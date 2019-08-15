import {IPCClient} from '../../backend/worker/client'
import {MakeTranspileAsset} from './classes/transpile'

export = function(name: string, options: any): any {
	return new (class extends MakeTranspileAsset {
		public async transpile(code: string) {
			const config = await this.config
			const reportErrors = !config.typescript.options.noEmitOnError
			const checkPromise = IPCClient.typeCheck({
				file: this.name,
				rootDir: this.options.rootDir,
				reportErrors
			})

			if(!reportErrors) {
				const {diagnostics} = await checkPromise

				if(diagnostics) {
					console.error(diagnostics)

					// tslint:disable-next-line:no-string-throw
					throw 'TypeScript errors were found while compiling'
				}
			}

			return super.transpile(code)
		}
	})(name, options)
}
