All [options of unvue([options]) API](/api#unvueoptions) can be kept in `unvue.config.js`, eg:

```js
module.exports = {
  entry: 'index.js'
}
```

Options of [app.generate([options])](/api#app-generateoptions) should be kept under `generate` property, eg:

```js
module.exports = {
  generate: {
    routes: ['/', '/user/foo/', '/user/bar/']
  }
}
```
