# parcel-plugin-typescript

Enhanced TypeScript integration for Parcel.

![Screenshot](./.assets/screenshot.png)

## Differences with Parcel native support

While Parcel has built-in transpiling support for TypeScript, this plugin provides [additional features](#features).

If you only need transpiling then this plugin might not be necessary. You can see this plugin as a Parcel version of `awesome-typescript-loader` or `ts-loader`.

## Features

- Type checking:  
  Checking your TypeScript code for errors, in a separate process for speed.
- Path mappings:  
  Rewriting your `import` on the fly accordingly to your `paths` and `baseUrl` compiler options.
- Custom AST transformers:
  Use your own TypeScript transformers

### Upcoming features

- TSLint support

### Angular Support

Angular support has been moved to [`parcel-plugin-angular`](https://github.com/fathyb/parcel-plugin-angular).

## Installation

`yarn add parcel-plugin-typescript`

or

`npm install parcel-plugin-typescript`

## Configuration

For configuration, you can pass a `parcel-plugin-typescript` object in your `tsconfig.json`:
```js
{
  "compilerOptions": {...},
  // the plugin options
  "parcel-plugin-typescript": {
    // If true type-checking is disabled
    "transpileOnly": false
  }
}
```
