import {CompilerHost, CompilerOptions} from '@angular/compiler-cli/src/ngtools_api2'

import {CompilerHost as LocalCompilerHost} from '../host'

export class AngularCompilerHost extends LocalCompilerHost implements CompilerHost {
	public readonly resources: {[path: string]: string} = {}

	constructor(
		options: CompilerOptions,
		private readonly compileResource: (file: string) => Promise<string>
	) {
		super(options)
	}

	public readResource(path: string) {
		return this.compileResource(path).catch(() => this.readFile(path)!)
	}
}
