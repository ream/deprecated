<p align="center">
<img src="https://user-images.githubusercontent.com/8784712/36352897-581670e6-14fa-11e8-98e6-163f10bd8ab5.png" width="400">
</p>

<p align="center"><a href="https://npmjs.com/package/ream"><img src="https://img.shields.io/npm/v/ream.svg?style=for-the-badge" alt="NPM version"></a> <a href="https://npmjs.com/package/ream"><img src="https://img.shields.io/npm/dm/ream.svg?style=for-the-badge" alt="NPM downloads"></a> <a href="https://circleci.com/gh/ream/ream/tree/master"><img src="https://img.shields.io/circleci/project/github/ream/ream/master.svg?style=for-the-badge" alt="CircleCI"></a>  <br><a href="https://github.com/egoist/donate"><img src="https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&amp;style=for-the-badge" alt="donate"></a> <a href="https://chat.egoist.moe"><img src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg?style=for-the-badge" alt="chat"></a></p>

## Install

```bash
yarn add ream
```

## Usage

Unlike a regular Vue SPA, you must export a `router` function in your app entry in order to make it work with Ream:

```js
// index.js
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default {
  router() {
    return new Router({
      mode: 'history',
      routes: [{
        path: '/',
        // Dynamically load your index component
        component: () => import('./index.vue')
      }]
    })
  }
}
```

And that's it, run `ream dev` and have fun playing your app at `http://localhost:4000`.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## Author

**ream** © [egoist](https://github.com/egoist), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by egoist with help from contributors ([list](https://github.com/ream/ream/contributors)).

> [github.com/egoist](https://github.com/egoist) · GitHub [@egoist](https://github.com/egoist) · Twitter [@_egoistlily](https://twitter.com/_egoistlily)
