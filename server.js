const express = require('express')
const unvue = require('./lib')

const app = unvue({
  dev: process.env.NODE_ENV !== 'production',
  cwd: 'examples/custom-server'
})

app.prepare()
  .then(() => {
    const server = express()

    server.get('*', app.getRequestHandler())

    server.listen(4000)
    console.log(`> Open http://localhost:4000`)
  })
