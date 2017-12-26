import {statSync} from 'fs'

const EXTENSIONS = ['', '.ts', '.tsx', '/index.ts', '/index.tsx']

export function findModule(path: string): string|null {
	for(const extension of EXTENSIONS) {
		const resolved = `${path}${extension}`

		try {
			const stat = statSync(resolved)

			if(stat.isFile() && !stat.isDirectory()) {
				return resolved
			}
		}
		catch {
			continue
		}
	}

	return null
}
