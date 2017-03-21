const http = require('http')
const unvue = require('../../')

const app = unvue({
  dev: process.env.NODE_ENV !== 'production'
})

app.prepare()
  .then(() => {
    const server = http.createServer((req, res) => {
      app.getRequestHandler()(req, res)
    })

    server.listen(4000)
    console.log(`> Open http://localhost:4000`)
  })
