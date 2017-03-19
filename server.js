const express = require('express')
const unvue = require('./lib')

const app = express()
unvue(app, { dev: true, cwd: 'example' })

app.listen(4000)
console.log(`> Open http://localhost:4000`)
