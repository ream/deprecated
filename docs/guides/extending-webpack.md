# Extending webpack

Ream uses a sensible webpack config, however it also allows you to freely customize it with [webpack-chain](https://github.com/mozilla-neutrino/webpack-chaink).

In your `ream.config.js`:

```js
module.exports = {
  chainWebpack(config, { isServer }) {
    //...
  }
}
```

Ream has two webpack configs under the hood, one for the client bundle, and the other one for the server bundle.
