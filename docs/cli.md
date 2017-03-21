# CLI

## Config File

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

Note that the usage of `generate` in CLI is slightly different from the API usage, it could also be a function which returns the `generate` option or a Promise which resolves the `generate` option:

```js
module.exports = {
  generate() {
    fetch('/my-users')
      .then(users => {
        return {
          routes: ['/'].concat(user.map(name => `/user/${name}/`))
        }
      })
  }
}
```

## Commands

### build

Build server bundle and client bundle, you will need this before running `unvue start`.

### start

Start production server.

### dev

Start development server.

### generate

Generate static website.
