import {existsSync} from 'fs'

const TS_EXTENSIONS = ['tsx', 'ts']

export function findModule(path: string): string|null {
	if(/\.tsx?/.test(path)) {
		return path
	}

	for(const extension of TS_EXTENSIONS) {
		const resolved = `${path}.${extension}`

		if(existsSync(resolved)) {
			return resolved
		}
	}

	return null
}
