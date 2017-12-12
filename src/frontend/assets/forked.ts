import {TypeCheckFile} from '../multi-process/ipc/client'
import {TranspileAsset} from './classes/transpile'

class TSAsset extends TranspileAsset {
	protected async transpile(code: string) {
		const {path} = await this.config

		TypeCheckFile(path, this.name)

		return super.transpile(code, 'other')
	}
}

export = TSAsset
