import {ParsedConfiguration, readConfiguration} from '@angular/compiler-cli'
import {
	CompilerHost, createCompilerHost, createProgram, EmitFlags, Program
} from '@angular/compiler-cli/src/ngtools_api2'

import {SourceFile, TransformerFactory} from 'typescript'

import {TranspileResult} from '../../interfaces'
import {formatDiagnostics} from '../format'
import {replaceResources} from '../transformers/angular/resources'

import {CompilerHost as LocalCompilerHost} from './host'
import {generateRouteLoader} from './route'

export interface LazyRouteMap {
	[key: string]: string
}

export class AngularCompiler {
	private program: Program|undefined = undefined
	private readonly host: LocalCompilerHost
	private readonly ngHost: CompilerHost
	private readonly config: ParsedConfiguration
	private entryFile: string|null = null

	private firstRun = true

	constructor(
		project: string,
		private readonly transformers: Array<TransformerFactory<SourceFile>> = []
	) {
		this.config = readConfiguration(project)

		const {options} = this.config
		const tsHost = new LocalCompilerHost(options)

		this.host = tsHost
		this.ngHost = createCompilerHost({options, tsHost})
	}

	public async transpile(_: string, path: string): Promise<TranspileResult> {
		if(this.entryFile === null) {
			// We assume the file file included by the project is the entry
			// It is used to inject the generated SystemJS loader
			this.entryFile = path
		}

		const program = await this.emit().catch(err => {
			console.error(err)

			throw err
		})

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
			js = `${js}\n${generateRouteLoader(program)}`
		}

		return {
			sources: {
				js
			}
		}
	}

	private async emit(): Promise<Program|undefined> {
		const {host} = this
		const {changedFiles} = host.store

		if(changedFiles.length > 0 || this.firstRun) {
			const {program: oldProgram} = this
			const {options, rootNames} = this.config

			this.firstRun = false
			changedFiles.splice(0)

			const program = createProgram({rootNames, options, host: this.ngHost, oldProgram})

			this.program = program

			await program.loadNgStructureAsync()

			const result = program.emit({
				emitFlags: EmitFlags.All,
				customTransformers: {
					beforeTs: [...this.transformers, replaceResources(() => true)]
				}
			})

			if(result.diagnostics.length > 0) {
				console.log(formatDiagnostics(result.diagnostics, process.cwd()))
			}

			return this.program
		}
	}
}
