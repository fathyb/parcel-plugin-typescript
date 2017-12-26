import {MakeTranspileAsset, TranspileAsset} from './classes/transpile'

export = function(name: string, pkg: string, options: any): TranspileAsset {
	return new (MakeTranspileAsset(name, pkg, options))()
}
