import * as tslint from 'tslint'
import * as ts from 'typescript'

export class Linter {
	private readonly linter: tslint.Linter | null = null

	constructor(
		program: ts.Program,
		private readonly config: tslint.Configuration.IConfigurationFile
	) {
		try {
			const tslintModule: typeof tslint = require('tslint')

			this.linter = new tslintModule.Linter({fix: false}, program)
		}
		catch {
			this.linter = null
		}
	}

	public lint(file: string, code: string): tslint.RuleFailure[] {
		const {linter} = this

		if(!linter) {
			return []
		}

		linter.lint(file, code, this.config)

		return linter
			.getResult()
			.failures
			.filter(failure => failure.getFileName() === file)
	}
}
