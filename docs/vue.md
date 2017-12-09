# Vue

Use Vue as the renderer in Ream.

```js
const Renderer = require('ream-renderer-vue')

const renderer = new Renderer(options)
```

## options

### postcss

Options for [postcss-loader](https://github.com/postcss/postcss-loader), by default it doesn't load any plugin.

## Guide

### Data pre-fetching

You can perform some asynchonous actions in route component's `getInitialData` method:

```js
export default {
  // `req` is only available on server-side
  getInitialData({ store, route, req }) {
    return store.dispatch('getUser', 'egoist')
  }
}

// or async/await
export default {
  async getInitialData({ store }) {
    await store.dispatch('getUser', 'egoist')
  }
}
```

Your page would not render util the `getInitialData` method is resolved.

The object that is returned by this method will also available in your route component as `this.$initialData`:

```vue
<template>
  <div>{{ $initialData.username }}</div>
</template>

<script>
export default {
  async getInitialData({ route }) {
    const user = fetchUserById(route.params.id)
    return {
      username: user.username
    }
  }
}
</script>
```
