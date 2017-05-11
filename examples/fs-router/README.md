# fs-router

`fsRouterPlugin` allows you to have a Next.js/Nuxt.js-like folder structure, which means file system is your router API.

To add this plugin:

```js
const fsRouterPlugin = require('ream/plugins/fs-router')

module.exports = {
  plugins: [
    fsRouterPlugin()
  ]
}
```

Then you will have a `@alias/fs-router` alias in your webpack config, which points to the router we generated for your `./pages` folder, eg: `./pages/index.vue` => `/`, `./pages/about/me.vue` => `/about/me`.

And each router view is split as independent chunk!

```js
import createFsRouter from '@alias/fs-router'

const createRouter = () => createFsRouter(options)

export default { createRouter }
```

Here `createFsRouter` accepts an option:

```js
createFsRouter({
  // extra options for creating Router instance
  // when we run: new Router()
  routerOptions,
  // extra options for each route in `routes` option of vue-router
  routeOptions
})
```
