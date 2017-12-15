import {ParsedConfiguration, readConfiguration} from '@angular/compiler-cli'
import {Diagnostic, EmitFlags, Program} from '@angular/compiler-cli/src/transformers/api'
import {createProgram} from '@angular/compiler-cli/src/transformers/program'

import * as ts from 'typescript'

import {TranspileResult} from '../../../interfaces'
import {reportDiagnostics} from '../../reporter'
import {removeDecorators} from '../../transformers/angular/remove-decorators'
import {replaceBootstrap} from '../../transformers/angular/replace-bootstrap'
import {findResources} from '../../transformers/angular/resources'

import {resolveEntryModuleFromMain} from './entry-resolver'
import {AngularCompilerHost} from './host'
import {generateRouteLoader} from './route'

export class AngularCompiler {
	private readonly transformers: Array<ts.TransformerFactory<ts.SourceFile>> = []
	private readonly host: AngularCompilerHost
	private readonly config: ParsedConfiguration
	private readonly resources: {
		[file: string]: string[]
	} = {}

	private entryFile: string|null = null
	private entryModule: {className: string, path: string}|null = null
	private program: Program|undefined = undefined
	private firstRun = true
	private shouldEmit = false
	private emitFiles: string[] = []

	constructor(project: string, compileResource: (file: string) => Promise<string>) {
		this.config = readConfiguration(project)

		const {options} = this.config
		this.host = new AngularCompilerHost(options, compileResource)
	}

	public async transpile(path: string): Promise<TranspileResult & {resources: string[]}> {
		if(this.entryFile === null) {
			// We assume the file file included by the project is the entry
			// It is used to inject the generated SystemJS loader
			this.entryFile = path
		}

		const program = await this.emit()

		const {basePath, outDir} = this.config.options

		if(!basePath) {
			throw new Error('basePath should be defined')
		}

		if(!outDir) {
			throw new Error('outDir should be defined')
		}

		let js = this.host.store.readFile(path.replace(/\.tsx?$/, '.js').replace(basePath, outDir))!

		// detect if the file is the main module
		if(program && path === this.entryFile) {
			js = `${js}\n${generateRouteLoader(path, program)}`
		}

		return {
			sources: {
				js
			},
			resources: this.resources[path] || []
		}
	}

	private async getProgram() {
		const {host} = this
		const {changedFiles} = host.store
		let {program} = this

		if(changedFiles.length > 0 || this.firstRun || !program) {
			const {program: oldProgram} = this
			const {options, rootNames} = this.config

			program = createProgram({rootNames, options, host, oldProgram})

			this.emitFiles = Array.from(changedFiles)
			this.firstRun = false
			this.program = program
			this.shouldEmit = true

			changedFiles.splice(0)

			await program.loadNgStructureAsync()

			this.updateResources(program)
		}

		return program
	}

	private async emit() {
		const program = await this.getProgram()

		if(this.shouldEmit) {
			const getTypeChecker = () => program.getTsProgram().getTypeChecker()
			const transformers: Array<ts.TransformerFactory<ts.SourceFile>> = [removeDecorators(getTypeChecker)]
			const diagnostics: Array<Diagnostic|ts.Diagnostic> = []

			diagnostics.push(...program.getNgStructuralDiagnostics())

			if(this.firstRun) {
				diagnostics.push(...program.getNgOptionDiagnostics(), ...program.getTsOptionDiagnostics())
			}

			const {entryFile, host} = this
			let {entryModule} = this

			if(!entryModule && entryFile) {
				const [path, className = 'default'] = resolveEntryModuleFromMain(entryFile, host, program.getTsProgram()).split('#')

				entryModule = {className, path}
				this.entryModule = entryModule
			}

			if(entryModule) {
				transformers.push(replaceBootstrap(file => file === this.entryFile, () => entryModule!, getTypeChecker))
			}

			diagnostics.push(
				...program.getTsSemanticDiagnostics(),
				...program.getTsSyntacticDiagnostics(),
				...program.getNgSemanticDiagnostics()
			)

			const result = program.emit({
				emitFlags: EmitFlags.All,
				customTransformers: {
					beforeTs: [...this.transformers, ...transformers]
				}
			})

			diagnostics.push(...result.diagnostics)

			reportDiagnostics(diagnostics)

			this.shouldEmit = false
		}

		return program
	}

	private updateResources(program: Program) {
		program
			.getTsProgram()
			.getSourceFiles()
			.filter(({text}) => /(templateUrl)|(styleUrls)/.test(text))
			.forEach(sourceFile =>
				this.resources[sourceFile.fileName] = findResources(sourceFile)
					.map(({path}) => typeof path === 'string' ? [path] : path)
					.reduce((a, b) => a.concat(b), [])
			)
	}
}
