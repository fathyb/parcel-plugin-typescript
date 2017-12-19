import {existsSync} from 'fs'

const EXTENSIONS = ['', '.ts', '.tsx', '/index.ts', '/index.tsx']

export function findModule(path: string): string|null {
	for(const extension of EXTENSIONS) {
		const resolved = `${path}${extension}`

		if(existsSync(resolved)) {
			return resolved
		}
	}

	return null
}
