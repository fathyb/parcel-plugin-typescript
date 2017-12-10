# parcel-plugin-typescript

A fast TypeScript type-checker plugin for Parcel.

![Screenshot](./.assets/screenshot.png)

## Differences with Parcel native support

The native Parcel intergation for TypeScript only transpiles and does not
support type-checking.
This plugin provides it by transpiling while checking on a separate process.
This will make incremental builds (like in watch mode) as fast as if type-checking
wasn't enabled.

A type error **will not prevent the bundle from being bundled**, we just report them.

## Installation
`yarn add parcel-plugin-typescript`

or

`npm install parcel-plugin-typescript`

## Roadmap

- [x] fork the type-checker in another process
- [x] implement incremental builds
- [ ] support custom transformers
- [ ] support TSLint (and share the AST with it)
