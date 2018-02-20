# Preloading data

In each route component, you can use `getInitialData` option to preload data before app is rendered.

```js
export default {
  async getInitialData() {
    await doSomeAsyncWork()
  }
}
```

Your app will start to render once the `getInitialData` method is resolved, for example, dispatch Vuex actions in this method:

```js
export default {
  async getInitialData({ route, store }) {
    await store.dispatch('getUser', route.params.username)
  }
}
```

Note that this method accepts an argument which has following properties:

```js
{
  route, // vue-router's route object, basically this.$route
  store, // The Vuex instance, if you exported it in entry file
  req // HTTP incoming message, only available on server-side
}
```

Note that in `ream generate`, the `req` object only contains a property: `url`.
