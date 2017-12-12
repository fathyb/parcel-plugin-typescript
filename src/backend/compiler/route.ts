import {Program} from '@angular/compiler-cli/src/ngtools_api2'

function parseNgModule(path: string): string {
	return `${path.replace(/#[^]*$/, '').replace(/\.ts$/, '')}.ngfactory`
}

export function generateRouteLoader(program: Program) {
	const routes = program.listLazyRoutes()

	return `
var __old_systemjs__ = typeof System !== 'undefined' && System

window.System = {
	import(module) {
		${routes.map(route =>
			`if(module === '${parseNgModule(route.route)}') {
				return import('${parseNgModule(route.referencedModule.filePath)}')
			}`
		)}

		if(__old_systemjs__) {
			return __old_systemjs__.import(module)
		}

		throw new Error('Cannot find module "' + module + '"')
	}
}
`
}
