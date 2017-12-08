# Config

## config

Default: `ream.config.js`

Use a config file if it exists.

## entry

Default: `src/index.js`

Path to entry file of your app.

## dev

Type: `boolean`<br>
Default: `undefined`

Run Ream in development mode (i.e. with dev-server and hot reloading).

## renderer

Required: `true`

A renderer instance.

## build

### staticFolder

Type: `string`<br>
Default: `static`

The static folder.

## cwd

Default: `process.cwd()`

The path to resolve your app entry from.

## output

### path

Default: `.ream`

The path to generate webpack bundles (for server-side and client-side).

## host

*CLI only*

Default: `0.0.0.0`

Server host.

## port

*CLI only*

Default: `5000`

Server port.

## extendWebpack

Type: `function`

Extend internal webpack config which is handled by [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain).


Parameters:

- config: Webpack-chain instance.
- context
  - dev: `boolean` Whether Ream is running in development mode
  - type: `string` Either `client` or `server`

## generate

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

The folder to output generated static files, it's relative to `output.path`.
