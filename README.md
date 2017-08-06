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

## Custom server

```js
const app = require('express')()
const Ream = require('ream')
const Renderer = require('ream-renderer-vue')

const renderer = new Renderer()

const ream = new Ream({
  renderer,
  dev: process.env.NODE_ENV === 'development'
})

ream.prepare()

app.get('*', ream.getRequestHandler())

app.listen(4000)
```
