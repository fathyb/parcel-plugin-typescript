import {dirname, relative} from 'path'

import {Program} from '@angular/compiler-cli/src/ngtools_api2'

function parseNgModule(path: string): string {
	return `${path.replace(/#[^]*$/, '').replace(/\.ts$/, '')}.ngfactory`
}

export function generateRouteLoader(main: string, program: Program) {
	const routes = program.listLazyRoutes()
	const mainDir = dirname(main)

	return `
var __old_systemjs__ = typeof System !== 'undefined' && System

window.System = {
	import(module) {
		${routes.map(route =>
			`if(module === '${parseNgModule(route.route)}') {
				return import('${relative(mainDir, parseNgModule(route.referencedModule.filePath))}')
			}`
		).join('\n')}

		if(__old_systemjs__) {
			return __old_systemjs__.import(module)
		}

		throw new Error('Cannot find module "' + module + '"')
	}
}
`
}
