<p align="center">
<img src="./docs/assets/REAM.png" alt="ream" width="100" />
</p>

<p align="center"><br><a href="https://npmjs.com/package/ream"><img src="https://img.shields.io/npm/v/ream.svg?style=flat" alt="NPM version"></a> <a href="https://npmjs.com/package/ream"><img src="https://img.shields.io/npm/dm/ream.svg?style=flat" alt="NPM downloads"></a> <a href="https://circleci.com/gh/ream/ream"><br/><img src="https://img.shields.io/circleci/project/ream/ream/master.svg?style=flat" alt="Build Status"></a> <a href="https://codecov.io/gh/ream/ream"><img src="https://codecov.io/gh/ream/ream/branch/master/graph/badge.svg" alt="codecov"></a> <a href="https://codeclimate.com/github/ream/ream"><img src="https://codeclimate.com/github/ream/ream/badges/gpa.svg" /></a><br />
<a href="#backers" alt="sponsors on Open Collective"><img src="https://opencollective.com/ream/backers/badge.svg" /></a>
<a href="#sponsors" alt="Sponsors on Open Collective"><img src="https://opencollective.com/ream/sponsors/badge.svg" /></a>
 <a href="https://github.com/egoist/donate"><img src="https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&amp;style=flat" alt="donate"></a>
</p>


## Introduction

Server-side rendered Vue.js app should be made easy, since vue-router is well optimized for SSR, we built ream on the top of it to make you build universal Vue.js app fast with fewer trade-offs, the only requirement is to export router instance in your entry file, which means you have full control of vue-router as well!

## Features

- Server-side rendering with code-split support
- Extensible webpack config
- Plugin system
- Next.js/Nuxt.js-like behavior via [plugin](https://ream.github.io/ream/#/plugin/fs-router)
- [Generate static website](https://ream.github.io/ream/#/?id=generate-static-website)
- [Writing blogs using Markdown/Vue Component](https://github.com/ream/ream-blog-plugin)
- Exposed a fluent API

[Check out online docs](https://ream.github.io/ream) *or* [Try writing server-rendered Vue.js app online!](https://glitch.com/~ream)

## Install

```bash
yarn add ream
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
// your vue router instance
import router from './router'

export default { router }
```

Run `npm run dev` to start development server.

To run in production server, run `npm run build && npm start`

**Dive into the [documentation](https://ream.github.io/ream) to get more.**


## Backers

Support us with a monthly donation and help us continue our activities. [[Become a backer](https://opencollective.com/ream#backer)]

<a href="https://opencollective.com/ream/backer/0/website" target="_blank"><img src="https://opencollective.com/ream/backer/0/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/1/website" target="_blank"><img src="https://opencollective.com/ream/backer/1/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/2/website" target="_blank"><img src="https://opencollective.com/ream/backer/2/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/3/website" target="_blank"><img src="https://opencollective.com/ream/backer/3/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/4/website" target="_blank"><img src="https://opencollective.com/ream/backer/4/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/5/website" target="_blank"><img src="https://opencollective.com/ream/backer/5/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/6/website" target="_blank"><img src="https://opencollective.com/ream/backer/6/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/7/website" target="_blank"><img src="https://opencollective.com/ream/backer/7/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/8/website" target="_blank"><img src="https://opencollective.com/ream/backer/8/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/9/website" target="_blank"><img src="https://opencollective.com/ream/backer/9/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/10/website" target="_blank"><img src="https://opencollective.com/ream/backer/10/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/11/website" target="_blank"><img src="https://opencollective.com/ream/backer/11/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/12/website" target="_blank"><img src="https://opencollective.com/ream/backer/12/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/13/website" target="_blank"><img src="https://opencollective.com/ream/backer/13/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/14/website" target="_blank"><img src="https://opencollective.com/ream/backer/14/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/15/website" target="_blank"><img src="https://opencollective.com/ream/backer/15/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/16/website" target="_blank"><img src="https://opencollective.com/ream/backer/16/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/17/website" target="_blank"><img src="https://opencollective.com/ream/backer/17/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/18/website" target="_blank"><img src="https://opencollective.com/ream/backer/18/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/19/website" target="_blank"><img src="https://opencollective.com/ream/backer/19/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/20/website" target="_blank"><img src="https://opencollective.com/ream/backer/20/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/21/website" target="_blank"><img src="https://opencollective.com/ream/backer/21/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/22/website" target="_blank"><img src="https://opencollective.com/ream/backer/22/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/23/website" target="_blank"><img src="https://opencollective.com/ream/backer/23/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/24/website" target="_blank"><img src="https://opencollective.com/ream/backer/24/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/25/website" target="_blank"><img src="https://opencollective.com/ream/backer/25/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/26/website" target="_blank"><img src="https://opencollective.com/ream/backer/26/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/27/website" target="_blank"><img src="https://opencollective.com/ream/backer/27/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/28/website" target="_blank"><img src="https://opencollective.com/ream/backer/28/avatar.svg"></a>
<a href="https://opencollective.com/ream/backer/29/website" target="_blank"><img src="https://opencollective.com/ream/backer/29/avatar.svg"></a>


## Sponsors

Become a sponsor and get your logo on our README on Github with a link to your site. [[Become a sponsor](https://opencollective.com/ream#sponsor)]

<a href="https://opencollective.com/ream/sponsor/0/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/1/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/2/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/3/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/4/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/5/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/6/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/7/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/8/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/9/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/9/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/10/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/10/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/11/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/11/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/12/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/12/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/13/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/13/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/14/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/14/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/15/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/15/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/16/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/16/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/17/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/17/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/18/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/18/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/19/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/19/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/20/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/20/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/21/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/21/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/22/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/22/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/23/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/23/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/24/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/24/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/25/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/25/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/26/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/26/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/27/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/27/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/28/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/28/avatar.svg"></a>
<a href="https://opencollective.com/ream/sponsor/29/website" target="_blank"><img src="https://opencollective.com/ream/sponsor/29/avatar.svg"></a>


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


