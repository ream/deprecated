# unvue

[![NPM version](https://img.shields.io/npm/v/unvue.svg?style=flat)](https://npmjs.com/package/unvue) [![NPM downloads](https://img.shields.io/npm/dm/unvue.svg?style=flat)](https://npmjs.com/package/unvue) [![Build Status](https://img.shields.io/circleci/project/egoist/unvue/master.svg?style=flat)](https://circleci.com/gh/egoist/unvue) [![codecov](https://codecov.io/gh/egoist/unvue/branch/master/graph/badge.svg)](https://codecov.io/gh/egoist/unvue)
 [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/egoist/donate)

> unopinionated, universal Vue.js app made simple

## Introduction

Server-side rendered Vue.js app should be made easy, since vue-router is well optimized for SSR, we built unvue on the top of it to make you build universal Vue.js app fast with fewer trade-offs, the only requirement is to export router instance in your entry file, which means you have full control of vue-router as well!

[Check out online docs](https://egoistian.com/unvue) *or* [Try writing server-rendered Vue.js app online!](https://glitch.com/~unvue)

## Install

```bash
yarn add unvue
```

## Usage

Add npm scripts:

```js
{
  "scripts": {
    "build": "unvue build",
    "start": "unvue start",
    "dev": "unvue dev"
  }
}
```

Then populate an `src/index.js` in current working directory and it should export at least `router` instance:

```js
// your vue router instance
import router from './router'

export { router }
```

Run `npm run dev` to start development server.

To run in production server, run `npm run build && npm start`

**Dive into the [documentation](https://egoistian.com/unvue) to get more.**

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## Author

**unvue** © [egoist](https://github.com/egoist), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by egoist with help from contributors ([list](https://github.com/egoist/unvue/contributors)).

> [egoistian.com](https://egoistian.com) · GitHub [@egoist](https://github.com/egoist) · Twitter [@rem_rin_rin](https://twitter.com/rem_rin_rin)
