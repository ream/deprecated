# Plugin

An example plugin that make it easier to define constants in your app runtime with webpack's `DefinePlugin`:

```js
const webpack = require('webpack')

function definePlugin(constants) {
  return ctx => {
    ctx.extendWebpack(config => {
      // add a webpack plugin
      config.plugin('define-constans')
        .use(webpack.DefinePlugin, [constants])
    })
  }
}
```

To use it, add it to `plugins` option in config file:

```js
module.exports = {
  plugins: [
    definePlugin({ SECRET: '****' })
  ]
}
```

## ctx

### options

The `options` ream uses internally.

#### cwd

User's current working directory

### dev

Type: `boolean`

Whether ream is running in development mode.

### extendWebpack(config, { type })

#### config

An instance of [webpack-chain](https://github.com/mozilla-rpweb/webpack-chain), could be the config for server bundle or client bundle.

#### type

Type: `string`<br>
Value: `oneOf(['server', 'client'])`

Config type, either server config or client config.
