<h1 align="center">Ream</h1>

<p align="center"><a href="https://npmjs.com/package/ream"><img src="https://img.shields.io/npm/v/ream.svg?style=flat" alt="NPM version"></a> <a href="https://npmjs.com/package/ream"><img src="https://img.shields.io/npm/dm/ream.svg?style=flat" alt="NPM downloads"></a> <a href="https://circleci.com/gh/ream/ream"><br/><img src="https://img.shields.io/circleci/project/ream/ream/master.svg?style=flat" alt="Build Status"></a> <a href="https://codecov.io/gh/ream/ream"><img src="https://codecov.io/gh/ream/ream/branch/master/graph/badge.svg" alt="codecov"></a> <a href="https://github.com/egoist/donate"><img src="https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&amp;style=flat" alt="donate"></a> <a href="https://chat.egoist.moe"><img src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg?style=flat" alt="chat"></a>
</p>


## Features

- Boilerplate-free, dramatically reduce boilerplate code
- Pluggable renderer, no more Vue vs React debate
- Extensible webpack config
- Generate static website
- Programmatic usage

## Install

```bash
yarn add ream@next

# If you're using Vue
# Install this too:
yarn add ream-renderer-vue@next
```

## Usage

First, populate an entry file `index.js`:

```js
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const createRouter = () => new Router({
  mode: 'history',
  routes: [{
    path: '/',
    // And your component for homepage
    component: () => import('./Home.vue')
  }]
})

export default { createRouter }
```

Then configure the `vue` renderer in config file `ream.config.js`:

```js
const Renderer = require('ream-renderer-vue')

module.exports = {
  entry: 'index.js', // default value
  renderer: new Renderer()
}
```

Finally run `ream dev` to start dev server.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## Author

**Ream** © [egoist](https://github.com/egoist), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by egoist with help from contributors ([list](https://github.com/ream/ream/contributors)).

> [egoist.moe](https://egoist.moe) · GitHub [@egoist](https://github.com/egoist) · Twitter [@_egoistlily](https://twitter.com/_egoistlily)
