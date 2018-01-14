# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.5.0"></a>
# [0.5.0](https://github.com/fathyb/parcel-plugin-typescript/compare/v0.4.0...v0.5.0) (2018-01-14)


### Bug Fixes

* **ipc:** support Windows named pipes ([80334f7](https://github.com/fathyb/parcel-plugin-typescript/commit/80334f7)), closes [#12](https://github.com/fathyb/parcel-plugin-typescript/issues/12)
* **tsc:** improve incremental build invalidation ([2196c0e](https://github.com/fathyb/parcel-plugin-typescript/commit/2196c0e))
* **tsc:** invalidate contents along with AST ([d03c6a9](https://github.com/fathyb/parcel-plugin-typescript/commit/d03c6a9))
* **tsc:** invalidate virtual files ([da22790](https://github.com/fathyb/parcel-plugin-typescript/commit/da22790))


### Features

* **error:** support `noEmitOnError` ([4d34626](https://github.com/fathyb/parcel-plugin-typescript/commit/4d34626)), closes [#9](https://github.com/fathyb/parcel-plugin-typescript/issues/9)



<a name="0.4.1"></a>
## [0.4.1](https://github.com/fathyb/parcel-plugin-typescript/compare/v0.4.0...v0.4.1) (2018-01-07)


### Bug Fixes

* **tsc:** improve incremental build invalidation ([b4eab4d](https://github.com/fathyb/parcel-plugin-typescript/commit/b4eab4d))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/fathyb/parcel-plugin-typescript/compare/v0.3.0...v0.4.0) (2018-01-05)

The Angular support has been moved to [`parcel-plugin-angular`](https://github.com/fathyb/parcel-plugin-angular). To improve stability a new IPC system is used.

### Bug Fixes

* **modules**: fix module ID mismatch ([#7](https://github.com/fathyb/parcel-plugin-typescript/issues/7))

<a name="0.2.5"></a>
# [0.2.5](https://github.com/fathyb/parcel-plugin-typescript/compare/v0.2.4...v0.2.5) (2017-12-21)


### Bug Fixes

* **resolve:** correctly map directory indices ([a543347](https://github.com/fathyb/parcel-plugin-typescript/commit/a543347))

<a name="0.3.0"></a>
# [0.3.0](https://github.com/fathyb/parcel-plugin-typescript/compare/v0.2.4...v0.3.0) (2017-12-21)

**NOTE: do not use this release (it's not tagged as latest anyway), the Angular support will be moved out of this plugin in the next days, this plugin will only provide TypeScript support.**

🎉 First Angular AOT support 🎉

### Features

- **Angular**
	- Compilation using AOT compiler
	- Support lazy-loading (AOT only)
	- Preprocess templates and style using Parcel (`templateUrl` or `styleUrls` only)
	- Experimental incremental AOT build on watch mode
	- Decorators are removed in AOT for smaller builds
- **Options**: you can now pass options to the plugin in `tsconfig.json`:
  ```js
  {
	  "compilerOptions": {
		  "strict": true
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

### Bug Fixes

* **resolve:** correctly map directory indices ([a543347](https://github.com/fathyb/parcel-plugin-typescript/commit/a543347))


<a name="0.2.4"></a>
## [0.2.4](https://github.com/fathyb/parcel-plugin-typescript/compare/v0.2.3...v0.2.4) (2017-12-19)


### Bug Fixes

* **mappings:** check baseUrl before transform ([10863f1](https://github.com/fathyb/parcel-plugin-typescript/commit/10863f1))



<a name="0.2.3"></a>
## [0.2.3](https://github.com/fathyb/parcel-plugin-typescript/compare/v0.2.2...v0.2.3) (2017-12-15)


### Bug Fixes

* **mappings:** fix es2015 import transformations ([bc9e6a4](https://github.com/fathyb/parcel-plugin-typescript/commit/bc9e6a4))
* **resolve:** default moduleResolution to node ([b0d111d](https://github.com/fathyb/parcel-plugin-typescript/commit/b0d111d))



<a name="0.2.2"></a>
## [0.2.2](https://github.com/fathyb/parcel-plugin-typescript/compare/v0.2.1...v0.2.2) (2017-12-15)


### Bug Fixes

* **logs:** do not log empty lines ([b71da83](https://github.com/fathyb/parcel-plugin-typescript/commit/b71da83))
* **mappings:** resolve when path is undefined ([1361c83](https://github.com/fathyb/parcel-plugin-typescript/commit/1361c83))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/fathyb/parcel-plugin-typescript/compare/v0.2.0...v0.2.1) (2017-12-13)


### Bug Fixes

* **build:** prevent hanging when only building ([5465994](https://github.com/fathyb/parcel-plugin-typescript/commit/5465994))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/fathyb/parcel-plugin-typescript/compare/v0.1.0...v0.2.0) (2017-12-12)


### Bug Fixes

* **type-check:** correctly load user tsconfig ([24900cb](https://github.com/fathyb/parcel-plugin-typescript/commit/24900cb))


### Features

* **transpiler:** add Angular AST transform support ([22a040e](https://github.com/fathyb/parcel-plugin-typescript/commit/22a040e))
* **transpiler:** support custom mappings ([5a550ce](https://github.com/fathyb/parcel-plugin-typescript/commit/5a550ce))



<a name="0.1.0"></a>
# 0.1.0 (2017-12-10)


### Features

* fork type-checker to separate process ([5a18d78](https://github.com/fathyb/parcel-plugin-typescript/commit/5a18d78))
* **error-report:** add error underlining ([24b70c9](https://github.com/fathyb/parcel-plugin-typescript/commit/24b70c9))
* **type-check:** implement incremental build ([fd771e8](https://github.com/fathyb/parcel-plugin-typescript/commit/fd771e8))


### Performance Improvements

* use type-checker to transpile on main thread ([d41d95f](https://github.com/fathyb/parcel-plugin-typescript/commit/d41d95f))
