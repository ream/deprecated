# Ream

Framework for server-rendered and statically generated web apps.

## Install

```bash
yarn add ream@next

# If you're using Vue
# Install this too:
yarn add ream-renderer-vue@next
```

## Usage

First, populate an entry file `src/index.js`:

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
  entry: './src/index.js', // default value
  renderer: new Renderer()
}
```

Finally run `ream dev` to start dev server.

## LICENSE

MIT &copy; [EGOIST](https://github.com/egoist)
