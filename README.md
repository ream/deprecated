# unvue

[![NPM version](https://img.shields.io/npm/v/unvue.svg?style=flat)](https://npmjs.com/package/unvue) [![NPM downloads](https://img.shields.io/npm/dm/unvue.svg?style=flat)](https://npmjs.com/package/unvue) [![Build Status](https://img.shields.io/circleci/project/egoist/unvue/master.svg?style=flat)](https://circleci.com/gh/egoist/unvue) [![codecov](https://codecov.io/gh/egoist/unvue/branch/master/graph/badge.svg)](https://codecov.io/gh/egoist/unvue)
 [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/egoist/donate)

> Universal Vue.js app made simple.

## Install

```bash
yarn add unvue
```

## Usage

```js
// server.js
const app = require('express')()
const unvue = require('unvue')

unvue(app, {
  dev: process.env.NODE_ENV !== 'production'
})

app.listen(3000)
console.log('> Open http://localhost:3000')
```

Run `node server.js`.

This assumes you have `src/index.js` in current working directory and it exports at least `app` and `router`:

```js
import Vue from 'vue'
// your vue router instance
import router from './router'
import App from './App.vue'

const app = new Vue({
  router,
  render: h => h(App)
})

export { app, router }
```

### preFetch

Every router-view component can have a `preFetch` property to pre-fetch data to fill Vuex store on the server side, this requires you to export `store` in `src/index.js` too.

```js
export default {
  preFetch({ store }) {
    return store.dispatch('asyncFetchData')
  }
}
```

If the action you want to perfom in `preFetch` method is async, it should return a Promise.

## API

### unvue(app, [options])

#### app

Express app instance.

#### options

##### html

Options for `html-webpack-plugin`, by default it is:

```js
{
  title: 'UNVUE',
  template: 'built-in template'
}
```

##### dev

Type: `boolean`<br>
Default: `false`

Run server in development mode which has hot-reloading enabled.

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
