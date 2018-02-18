# Extending webpack

Ream uses a sensible webpack config, however it also allows you to freely customize it with [conpack](https://github.com/egoist/conpack) which makes it easier to update `rules` and `plugins` in webpack config.

In your `ream.config.js`:

```js
module.exports = {
  extendWebpack(config, { isServer }) {
    config.set('resolve.alias.someAlias$', 'value')
  }
}
```

Ream has two webpack configs under the hood, one for the client bundle, and the other one for the server bundle.
