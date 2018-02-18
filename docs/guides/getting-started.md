# Getting started

To get started with Ream, you only need to export a router function in your entry file:

```js
// index.js
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default {
  router() {
    return new Router({
      mode: 'history', // <== Must use history API
      routes: [
        {
          path: '/',
          // Load route component with dynamic import
          // To make code splitting happen
          component: () => import('./index.vue')
        }
      ]
    })
  }
}
```

Here you export a router function instead of a router instance because we need to use a fresh router instance for each http request in order to [avoid stateful singletons](https://ssr.vuejs.org/en/structure.html#avoid-stateful-singletons).
