# Config

## Top-level options

### entry

Default: `src/index.js`

Path to entry file of your app.

### dev

Type: `boolean`<br>
Default: `undefined`

Run Ream in development mode (i.e. with dev-server and hot reloading).

### renderer

Required: `true`

A renderer instance.

### output

#### path

Default: `.ream`

The path to generate webpack bundles (for server-side and client-side).

### cwd

Default: `process.cwd()`

The path to resolve your app entry from.

### devServer

Options for [webpack-dev-server](https://webpack.js.org/configuration/dev-server/#devserver).

### Generate options

Options for `ream generate` command.

#### routes

Type: `Array` `object`

```js
module.exports = {
  generate: {
    routes: ['/', '/about/', '/user/egoist/', '/user/trump/']
  }
}
```

Or as a plain object:

```js
module.exports = {
  generate: {
    routes: {
      '/': true,
      '/about': true,
      '/user/:name': [
        { name: 'egoist' },
        { name: 'trump }
      ]
    }
  }
}
```

#### dist

Default: `dist`

The path to output generated static files.
