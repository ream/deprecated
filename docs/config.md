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

### host

*CLI only*

Default: `0.0.0.0`

Server host.

### port

*CLI only*

Default: `5000`

Server port.

### devServer

Options for [webpack-dev-server](https://webpack.js.org/configuration/dev-server/#devserver). We use the dev-server to build client-side app.

### jsx

Type: `string`<br>
Default: `vue`

Support custom JSX syntax, you can set it to `vue` `react` or a JSX pragma like `h`.

### extendWebpack

Type: `function`

Extend internal webpack config which is handled by [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain).


Parameters:

- config: Webpack-chain instance.
- context
  - dev: `boolean` Whether Ream is running in development mode
  - type: `string` Either `client` or `server`

## Generate options

Options for `ream generate` command.

### routes

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
        { name: 'trump' }
      ]
    }
  }
}
```

### folder

Default: `generated`

The folder to output generated static files, it's relave to `output.path`.
