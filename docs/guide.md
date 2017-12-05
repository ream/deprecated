# Guide

## Static folder

If `static` folder exists in current working directly, the files inside will be served to root path, i.e.:

`static/favicon.ico` will be available at `http://localhost:5000/favicon.ico`

Check out more at [config](config.md#staticfolder) page.

## Data pre-fetching

You can perform some asynchonous actions in route component's `asyncData` method:

```js
export default {
  asyncData({ store }) {
    return store.dispatch('getUser', 'egoist')
  }
}

// or async/await
export default {
  async asyncData({ store }) {
    await store.dispatch('getUser', 'egoist')
  }
}
```

