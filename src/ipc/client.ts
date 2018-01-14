import * as http from 'http'

import {getSocketPath} from './dynamic'

export type Keys<T, U> = (keyof T) & (keyof U)
export type Client<RQ, RS, K extends Keys<RQ, RS> = Keys<RQ, RS>> = {
	[P in K]: (data: RQ[P]) => Promise<RS[P]>
}

export function Client<RQ, RS, K extends Keys<RQ, RS> = Keys<RQ, RS>>(name: string, keys: K[]): Client<RQ, RS, K> {
	const object: Partial<Client<RQ, RS>> = {}

	keys.forEach(key => object[key] = data => request<RQ, RS>(name, key, data))

	return object as Client<RQ, RS>
}

async function request<RQ, RS, K extends Keys<RQ, RS> = Keys<RQ, RS>>(
	name: string, endpoint: K, data: RQ[K]
): Promise<RS[K]> {
	return new Promise<RS[K]>((resolve, reject) => {
		const serialized = JSON.stringify({data})
		const req = http.request({
			socketPath: getSocketPath(name),
			path: `/${endpoint}`,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(serialized)
			}
		}, res => {
			const chunks: string[] = []

			res
				.setEncoding('utf8')
				.on('end', () => resolve(JSON.parse(chunks.join('')).result))
				.on('data', chunk =>
					chunks.push(
						Buffer.isBuffer(chunk)
							? chunk.toString('utf-8')
							: chunk
					)
				)
		})

		req.on('error', reject)
		req.write(serialized)
		req.end()
	})
}
