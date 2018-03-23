## Ream(options)

### options.dev

Type: `string`<br>
Default: `false`<br>
API only: `true`

Build or run in development mode, you should not set it when using Ream CLI, it won't work either since we will automatically infer for you.

### options.entry

Type: `string`<br>
Default: `index.js`

The path to entry file, you should at least export `createRouter` factory here.

### options.html

Type: `string`<br>
Default: [`ream/app/index.template.html`](/packages/ream/app/index.template.html)

The path to HTML template file.

### options.plugins

Type: `Array`<br>
Default: `[]`

Ream plugins.

## ream

### ream.getRequestHandler()

Type: `() => Promise<RequestHandler>`

Get request handler for `http.createServer`.

### ream.getServer()

Type: `() => Promise<Polka>`

Return a Promise which resolves to an instance of [Polka](https://github.com/lukeed/polka).

### ream.build()

Type: `() => Promise`

Build with webpack.

### ream.generate(options)

Type: `(Options) => Promise`

Generate static html files.

#### options.routes

Type: `string[]`<br>
Default: `['/']`

An array of routes to generate, query parameter is not supported.
