const http = require('http')
const path = require('path')
const axios = require('axios')
const tap = require('tap')
const ream = require('../..')

module.exports = function(baseDir, fn) {
  // Calculate relative base directory for consistent snapshots.
  const relativeBaseDir = path.relative('.', baseDir)
  return tap.test(relativeBaseDir, async t => {
    const app = ream({ baseDir, dev: false })
    app.chainWebpack(config => {
      config.plugins.delete('webpackbar')
      // Ensure consistent filenames in different environments.
      const filename = '[name].js'
      config.merge({
        output: {
          filename,
          chunkFilename: filename
        }
      })
    })
    await app.build()
    const handler = await app.getRequestHandler()
    const server = http.createServer(handler)
    server.listen(0) // Automatically pick a random free port.
    try {
      const port = server.address().port
      const baseURL = `http://127.0.0.1:${port}`
      const axiosInstance = axios.create({ baseURL })
      await fn(t, axiosInstance)
    } finally {
      server.close()
    }
  })
}
