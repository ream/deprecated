# unvue

[![NPM version](https://img.shields.io/npm/v/unvue.svg?style=flat)](https://npmjs.com/package/unvue) [![NPM downloads](https://img.shields.io/npm/dm/unvue.svg?style=flat)](https://npmjs.com/package/unvue) [![Build Status](https://img.shields.io/circleci/project/egoist/unvue/master.svg?style=flat)](https://circleci.com/gh/egoist/unvue) [![codecov](https://codecov.io/gh/egoist/unvue/branch/master/graph/badge.svg)](https://codecov.io/gh/egoist/unvue)
 [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/egoist/donate)

> unopinionated, universal Vue.js app made simple

## Introduction

Server-side rendered Vue.js app should be made easy, since vue-router is well optimized for SSR, we built unvue on the top of it to make you build universal Vue.js app fast with fewer trade-offs, the only requirement is to export router instance in your entry file, which means you have full control of vue-router as well!

[Check out all the features](/docs/features.md) *or* [Try writing server-rendered Vue.js app online!](https://glitch.com/edit/#!/join/35cdafcd-9a59-4da2-a232-6c13fecdc6f7)

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

### Root component

By default we have a [built-in root component](/app/App.vue), you can export a custom one as well:

```js
// src/index.js
import App from './components/App.vue'

export { App }
```

The `App` component will be used in creating Vue instance:

```js
new Vue({
  render: h => h(App)
})
```

### Vuex

You don't have to use Vuex but you can, export Vuex instance `store` in `src/index.js` to enable it:

```js
import store from './store'

export { store }
```

#### preFetch

Every router-view component can have a `preFetch` property to pre-fetch data to fill Vuex store on the server side.

```js
export default {
  preFetch({ store }) {
    return store.dispatch('asyncFetchData')
  }
}
```

If the action you want to perfom in `preFetch` method is async, it should return a Promise.

#### preFetchCache

Similar to `preFetch` but you can cache data across requests:

```js
export default {
  // component name is required
  name: 'my-view',
  preFetchCache({ store, cache }) {
    return store.dispatch('fetchUser', { cache, user: 1 })
  }
}
```

Then in your store, it can have such shape:

```js
{
  actions: {
    fetchUser({ commit }, payload) {
      // use cache if possible
      if (payload.cache) return commit('SET_USER', cache)
      return fetch('/user/' + payload.user)
        .then(res => res.json())
        .then(user => {
          commit('SET_USER', user)
          // the resolved value would be `cache` in next request
          return user
        })
    }
  }
}
```

### Modify `<head>`

`unvue` uses [vue-meta](https://github.com/declandewet/vue-meta) under the hood, so you can just set `head` property on Vue component to provide custom head tags:

```js
export default {
  head: {
    title: 'HomePage'
  }
}
```

Check out [vue-meta](https://github.com/declandewet/vue-meta) for details, its usage is the same here except that we're using `head` instead of `metaInfo` as key name.

### createConfig

Create webpack config only.

```js
const createConfig = require('unvue/lib/create-config')

const config = createConfig({
  type, // `server` or `client`
  dev,
  // ...
})

const webpackConfig = config.toConfig()
// perform your own build process
```

The `config` is a [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain) config instance, which allows you to easily modify original webpack config.

## API

If you're using CLI, the options (expect those marked as `API only`) can be kept at `unvue.config.js` .

You can also check out [example server](/server.js) which is custom server that uses the API.

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

*API only*

Run server in development mode which has hot-reloading enabled.

##### build

Type: `boolean`<br>
Default: `true`

*API only*

In production mode (when `dev` is `false`), unvue will build your project before starting the webserver, you can disable this if you already run [unvue.build](#unvuebuildoptions).

##### cwd

Type: `string`<br>
Default: `process.cwd()`

##### preFetchCache

Type: `object`<br>
Default: `{ max: 1000, maxAge: 1000 * 60 * 15 }`

*`unvue()` only*

Options for [lru-cache](https://www.npmjs.com/package/lru-cache) store of `preFetchCache` option in your component.

##### postCompile

Type: `function`

*`unvue()` only*

Invoke a function when compilation is done.

##### extendWebpack

Type: `function`

Extend webpack config generated by [webpack-chain](https://github.com/mozilla-rpweb/webpack-chain), for example to show progress bar while building client bundle in production mode:

```js
const ProgressPlugin = require('webpack/lib/ProgressPlugin')

unvue(app, {
  extendWebpack(config, { type, dev }) {
    if (type === 'client' && !dev) {
      config.plugin('display-progress')
        .use(ProgressPlugin)
    }
  }
})
```

### unvue.build([options])

Similar to `unvue([options])` but only build app in production mode without starting the server.

### createConfig([options])

#### options

Same as options in `unvue` except `unvue only` options.

## FAQ

### Here's a missing feature!

**"Can you update webpack config *this way* so I can use that feature?"** If you have the same question, before we actually think this feature is necessary and add it, you can [extend webpack config](#extendwebpack) yourself to implement it. With [webpack-chain](https://github.com/mozilla-rpweb/webpack-chain) you have full control of our webpack config, check out the default [config instance](/lib/create-config.js).

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
