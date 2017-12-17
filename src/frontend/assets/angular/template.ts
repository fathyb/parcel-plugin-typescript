import HTMLAsset = require('parcel-bundler/lib/assets/HTMLAsset')
import parse = require('posthtml-parser')
import api = require('posthtml/lib/api')

export class TemplateAsset extends HTMLAsset {
	public parse(code: string) {
		const res = parse(code)

		res.walk = api.walk
		res.match = api.match

		return res
	}
}
