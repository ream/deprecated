<p align="center">
<img src="./docs/assets/REAM.png" alt="ream" width="100" />
</p>

<p align="center"><br><a href="https://npmjs.com/package/ream"><img src="https://img.shields.io/npm/v/ream.svg?style=flat" alt="NPM version"></a> <a href="https://npmjs.com/package/ream"><img src="https://img.shields.io/npm/dm/ream.svg?style=flat" alt="NPM downloads"></a> <a href="https://circleci.com/gh/ream/ream"><br/><img src="https://img.shields.io/circleci/project/ream/ream/master.svg?style=flat" alt="Build Status"></a> <a href="https://codecov.io/gh/ream/ream"><img src="https://codecov.io/gh/ream/ream/branch/master/graph/badge.svg" alt="codecov"></a> <a href="https://codeclimate.com/github/ream/ream"><img src="https://codeclimate.com/github/ream/ream/badges/gpa.svg" /></a> <a href="https://github.com/egoist/donate"><img src="https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&amp;style=flat" alt="donate"></a>
</p>


<h2 align="center">Introduction</h2>

Server-side rendered Vue.js app should be made easy, since vue-router is well optimized for SSR, we built ream on the top of it to make you build universal Vue.js app fast with fewer trade-offs, the only requirement is to export router instance in your entry file, which means you have full control of vue-router as well!

## Features

- Server-side rendering with code-split support
- Extensible webpack config
- Plugin system
- Next.js/Nuxt.js-like behavior via [plugin](https://ream.github.io/ream/#/plugin/fs-router)
- [Generate static website](https://ream.github.io/ream/#/?id=generate-static-website)
- [Writing blogs using Markdown/Vue Component](https://github.com/ream/blog-plugin)
- Exposed a fluent API

[Check out online docs](https://ream.github.io/ream) *or* [Try writing server-rendered Vue.js app online!](https://glitch.com/edit/#!/project/ream)

## Install

```bash
yarn add ream@beta
```

## Usage

Add npm scripts:

```js
{
  "scripts": {
    "build": "ream build",
    "start": "ream start",
    "dev": "ream dev"
  }
}
```

Then populate an `src/index.js` in current working directory and it should export at least `router` instance:

```js
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const createRouter = () => new Router({
  mode: 'history',
  routes: [/* ... */]
})

export default { createRouter }
```

Run `npm run dev` to start development server.

To run in production server, run `npm run build && npm start`

**Dive into the [documentation](https://ream.github.io/ream) to get more.**

## Prior Art

`ream` wouldn't exist if it wasn't for excellent prior art, we're inspired by these projects:

- [Nuxt.js](https://github.com/nuxt/nuxt.js)
- [Next.js](https://github.com/zeit/next.js)

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## Author

**ream** © [egoist](https://github.com/egoist), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by egoist with help from contributors ([list](https://github.com/ream/ream/contributors)).

> [egoistian.com](https://egoistian.com) · GitHub [@egoist](https://github.com/egoist) · Twitter [@rem_rin_rin](https://twitter.com/rem_rin_rin)


