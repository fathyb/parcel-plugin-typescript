# parcel-plugin-typescript

Enhanced TypeScript integration for Parcel.

![Screenshot](./.assets/screenshot.png)

## Differences with Parcel native support

Parcel has built-in transpiling support for TypeScript OOB. This plugin provides additionnal features listed in [Features](#features).

If you only need transpiling then this plugin might not be necessary. You can see
this plugin as a Parcel version of `awesome-typescript-loader` or `ts-loader`.

This plugin is in it's early stage and may not be stable. This first stable version will be `1.0.0`.

## Features

- Transpiling: this is what you get when this plugin is not installed, straight and simple
transpilation TS -> JS
- Type checking: it checks your TypeScript code for errors in a separated process for speed
- Path mappings: it rewrites your `import` on the fly accordingly to your `paths` and `baseUrl`
compiler options
- Angular support (experimental, only enabled if Angular is installed) :
	- AOT compilation, using the official Angular compiler for smaller and faster applications.
	- Lazy Loading, the plugin automagically splits your Angular modules in multiple JavaScript files with Parcel when you use lazy routes.
	- Template and style parsing, your templates and style are processed by Parcel to find and replaces resources, even in AOT.
	- Transformations :
		- It removes all your Angular decorators in AOT mode for smaller bundles
		- It replaces the `@angular/platform-browser-dynamic` with `@angular/platform-browser` module in AOT mode, so you can keep one main file

### Coming features

- TSLint support
- User defined AST transformers

## Installation
`yarn add parcel-plugin-typescript`

or

`npm install parcel-plugin-typescript`

And that's it, z e r o configuration.

## Configuration

You can pass a `parcelTsPluginOptions` object in your `tsconfig.json`, here are the defaults :
```json
{
  "compilerOptions": {
    // some TypeScript compilerOptions
  },
  // the plugin options
  "parcelTsPluginOptions": {
    // If true type-checking is disabled
    "transpileOnly": false,

    // Angular options
    "angular": {
      // What compiler should we use when watching or serving
      "watch": "jit",

      // What compiler should we use when building (parcel build)
      "build": "aot"
    }
  }
}
```

## Angular

Angular >= 5.1.0 supported.

This plugin fully supports compiling in AOT or JIT using the official Angular compiler. You need to have both `@angular/compiler` and `@angular/compiler-cli` installed.

### Entry file

To make it easy to switch between JIT and AOT mode we automatically translate your JIT bootstrap code to AOT if you are using the AOT compiler.

```ts
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic'
import {enableProdMode} from '@angular/core'
import {AppModule} from './app/app.module'

if(process.env.NODE_ENV === 'production') {
  enableProdMode()
}

platformBrowserDynamic().bootstrapModule(AppModule)
```

will be transformed to :

```ts
import {platformBrowser} from '@angular/platform-browser'
import {enableProdMode} from '@angular/core'
import {AppModuleNgFactory} from './app/app.module.ngfactory'

if(process.env.NODE_ENV === 'production') {
  enableProdMode()
}

platformBrowser().bootstrapModuleFactory(AppModuleNgFactory)
```

### Known issues

- The AOT mode is experimental, the watch mode is buggy and reports module errors
- Template or style updates do not trigger a build
- Lazy-loading does not work in JIT
