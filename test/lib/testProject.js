const http = require('http')
const path = require('path')
const url = require('url')
const axios = require('axios')
const puppeteer = require('puppeteer')
const tap = require('tap')
const ream = require('../..')

class Client {
  constructor(baseURL) {
    this.baseURL = baseURL
    this.axios = axios.create({ baseURL })
  }

  async loadPage(pageUrl) {
    if (!this.browser) {
      // NOTE: race condition here.
      // Please don't call loadPage() asynchronously.
      this.browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
    }
    const page = await this.browser.newPage()
    await page.goto(this.resolveUrl(pageUrl))
    return page
  }

  resolveUrl(pageUrl) {
    return url.resolve(this.baseURL, pageUrl)
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
    }
  }
}

module.exports = function(baseDir, fn) {
  // Calculate relative base directory for consistent snapshots.
  const relativeBaseDir = path.relative('.', baseDir)
  return tap.test(relativeBaseDir, async t => {
    const app = ream(
      {
        baseDir,
        dev: false
      },
      {
        css: {
          extract: false
        },
        minimize: false
      }
    )
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
    const port = server.address().port
    const baseURL = `http://127.0.0.1:${port}`
    const client = new Client(baseURL)
    try {
      await fn(t, client)
    } finally {
      await client.close()
      server.close()
    }
  })
}
