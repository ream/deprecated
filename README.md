# Ream

Framework for server-rendered and statically generated web apps.

## Install

```bash
yarn add ream

# If you're using Vue
# Install this too:
yarn add ream-renderer-vue
```

## Usage

```js
// ream.config.js
const Renderer = require('ream-renderer-vue')

module.exports = {
  entry: './src/index.js', // default value
  renderer: new Renderer()
}
```

Then run `ream dev` to start dev server.

## LICENSE

MIT &copy; [EGOIST](https://github.com/egoist)
