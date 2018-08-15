const { createServer } = require('http')
const ream = require('ream')
const config = require('./ream.config')

const port = process.env.PORT || 3000

const app = ream(config)

// Get the request handler for http.createServer
// app.getRequestHandler() returns a Promise which resolves to the request handler
app.getRequestHandler().then(handler => {
  const server = createServer((req, res) => {
    handler(req, res)
  })

  server.listen(port, err => {
    if (err) {
      console.error(err)
    }
  })
})

app.on('renderer-ready', () => {
  console.log(`> Open http://localhost:${port}`)
})
