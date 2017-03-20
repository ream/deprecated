const express = require('express')
const unvue = require('./lib')

const app = express()

unvue(app, {
  dev: process.env.NODE_ENV !== 'production',
  cwd: 'example',
  build: false,
  postCompile() {
    console.log('> Open http://localhost:4000')
  }
})

app.listen(4000)
