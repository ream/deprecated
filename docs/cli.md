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
    return fetch('/my-users')
      .then(users => {
        return {
          routes: ['/'].concat(user.map(name => `/user/${name}/`))
        }
      })
  }
}
```

## Babel/PostCSS config file

In CLI we automatically load babel/postcss config file as the default value of [babel](/api#babel) and [postcss](/api/postcss) option.

If you have a Babel config file in working directory but don't manage to use it, you can set `babelrc: false` to disable itself, eg: you have `.babelrc` to use with other projects:

```js
{
  "babelrc": false,
  "presets": ["unrelated-preset"]
}
```

Set `babel` `postcss` option in config file will also override the default options.

## Commands

### build

Build server bundle and client bundle, you will need this before running `unvue start`.

### start

Start production server.

### dev

Start development server.

### generate

Generate static website.

