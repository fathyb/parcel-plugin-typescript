# parcel-plugin-typescript

Complete TypeScript integration for Parcel.

![Screenshot](./.assets/screenshot.png)

## Differences with Parcel native support

Parcel has built-in transpiling support for TypeScript OOB. This plugin provides additionnal features like :
- type checking
- paths mapping
- Angular support

If you only need transpiling then this plugin might not be necessary. You can see
this plugin as a Parcel version of `awesome-typescript-loader` or `ts-loader`.

### Features

- Transpiling: this is what you get when this plugin is not installed, straight and simple
transpilation TS -> JS
- Type checking: it checks your TypeScript code for errors in a separated process for speed
- Path mappings: it rewrites your `import` on the fly accordingly to your `paths` and `baseUrl`
compiler options
- Angular support: it supports Angular resources inlining (eg. `templateUrl` -> `template`) for JIT compilation

### Coming features

*Your help is welcome*

- Angular AOT compilation using official Angular toolchain
	- on the `angular/aot` branch
- TSLint support
- User defined AST transformers

## Installation
`yarn add parcel-plugin-typescript`

or

`npm install parcel-plugin-typescript`

And that's it, z e r o configuration.
