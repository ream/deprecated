## dev

```js
const http = require('http')
const app = new Ream({ dev: true })

const handle = await app.getRequestHandler()
http.createServer((req, res) => {
  handle(req, res)
})
```

### build

```js
const app = new Ream(options)

await app.build()
```

### start

```js
const app = new Ream(options)

app.start()
```

### generate

```js
const app = new Ream(options)

await app.build()
await app.generate()
```
