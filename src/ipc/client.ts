import rp = require('request-promise')

import {getSocketPath} from './dynamic'

async function request<RQ, RS, K extends Keys<RQ, RS> = Keys<RQ, RS>>(
	name: string, endpoint: K, data: RQ[K]
): Promise<RS[K]> {
	const response: {result?: RS[K], error?: any} = await rp({
		uri: `http://unix:${getSocketPath(name)}:/${endpoint}`,
		method: 'POST',
		body: {data},
		json: true
	})

	if(response.error) {
		throw new Error(response.error)
	}

	return response.result!
}

export type Keys<T, U> = (keyof T) & (keyof U)
export type Client<RQ, RS, K extends Keys<RQ, RS> = Keys<RQ, RS>> = {
	[P in K]: (data: RQ[P]) => Promise<RS[P]>
}

export function Client<RQ, RS, K extends Keys<RQ, RS> = Keys<RQ, RS>>(name: string, keys: K[]): Client<RQ, RS, K> {
	const object: Partial<Client<RQ, RS>> = {}

	keys.forEach(key => object[key] = data => request<RQ, RS>(name, key, data))

	return object as Client<RQ, RS>
}
