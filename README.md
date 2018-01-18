# parcel-plugin-typescript

Enhanced TypeScript integration for Parcel.

![Screenshot](./.assets/screenshot.png)

## Differences with Parcel native support

While Parcel has built-in transpiling support for TypeScript, this plugin provides [additionnal features](#features).

If you only need transpiling then this plugin might not be necessary. You can see this plugin as a Parcel version of `awesome-typescript-loader` or `ts-loader`.

This plugin is in an early stage and may not be stable. This first stable version will be `1.0.0`.

## Features

- Type checking:  
  Checking your TypeScript code for errors, in a separate process for speed.
- Path mappings:  
  Rewriting your `import` on the fly accordingly to your `paths` and `baseUrl` compiler options.

### Upcoming features

- TSLint support
- User-defined AST transformers

### Angular Support

Angular support has been moved to [`parcel-plugin-angular`](https://github.com/fathyb/parcel-plugin-angular).

## Installation

`yarn add parcel-plugin-typescript`

or

`npm install parcel-plugin-typescript`

## Configuration

For configuration, you can pass a `parcelTsPluginOptions` object in your `tsconfig.json`:
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

## Sponsor

If you have a couple bucks to spare here are three non-profit organizations I encourage you to help to build a better future:
- [ChildFund](https://www.childfund.org/Ways-To-Donate)
- [UN Women](https://donate.unwomen.org/now)
- [Mozilla](https://donate.mozilla.org)
