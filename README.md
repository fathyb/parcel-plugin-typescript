# parcel-plugin-typescript

Enhanced TypeScript integration for Parcel.

![Screenshot](./.assets/screenshot.png)

## Differences with Parcel native support

Parcel has built-in transpiling support for TypeScript OOB. This plugin provides additionnal features listed in [Features](#features).

If you only need transpiling then this plugin might not be necessary. You can see this plugin as a Parcel version of `awesome-typescript-loader` or `ts-loader`.

This plugin is in it's early stage and may not be stable. This first stable version will be `1.0.0`.

## Features

- Type checking: it checks your TypeScript code for errors in a separated process for speed
- Path mappings: it rewrites your `import` on the fly accordingly to your `paths` and `baseUrl` compiler options

### Coming features

- TSLint support
- User defined AST transformers

## Installation

`yarn add parcel-plugin-typescript`

or

`npm install parcel-plugin-typescript`

## Configuration

You can pass a `parcelTsPluginOptions` object in your `tsconfig.json` :
```js
{
  "compilerOptions": {...},
  // the plugin options
  "parcelTsPluginOptions": {
    // If true type-checking is disabled
    "transpileOnly": false
  }
}
```
