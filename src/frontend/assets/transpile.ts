import {MakeTranspileAsset, TranspileAsset} from './classes/transpile'

export = function(name: string, options: any): TranspileAsset {
	return new (MakeTranspileAsset(name, options))()
}
