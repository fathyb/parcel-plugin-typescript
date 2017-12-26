import {IPCClient} from '../../backend/worker/client'
import {MakeTranspileAsset} from './classes/transpile'

export = function(name: string, pkg: string, options: any): any {
	return new (class extends MakeTranspileAsset(name, pkg, options) {
		public transpile(code: string) {
			this.config.then(({path}) => IPCClient.typeCheck({file: this.name, tsConfig: path}))

			return super.transpile(code)
		}
	})()
}
