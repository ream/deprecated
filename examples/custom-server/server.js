const http = require('http')
const unvue = require('../../')

const app = unvue({
  dev: process.env.NODE_ENV !== 'production'
})

console.log('> Starting...')
app.prepare()
  .then(() => {
    const server = http.createServer((req, res) => {
      app.getRequestHandler()(req, res)
    })

    server.listen(4000)
    console.log(`> Open http://localhost:4000`)
  })

app.on('valid', () => {
  unvue.displayStats(app.stats)
  console.log(`> Open http://localhost:4000`)
})
