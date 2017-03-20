const express = require('express')
const unvue = require('./lib')

const app = express()

unvue(app, {
  dev: false,
  cwd: 'example',
  postCompile() {
    console.log('\n> Open http://localhost:4000')
  }
})

app.listen(4000)
