const path = require('path')
const fs = require('fs-extra')
const serverRenderer = require('vue-server-renderer')
const handleWebpackConfig = require('./handle-config')
const {
  renderTemplate
} = require('./utils')

class SendFilesServer {
  constructor(cb, ream) {
    this.cb = cb
    this.ream = ream
  }

  apply(compiler) {
    compiler.plugin('done', () => {
      const mfs = compiler.outputFileSystem
      const bundlePath = this.ream.resolveDist('server', 'vue-ssr-server-bundle.json')
      const bundle = JSON.parse(mfs.readFileSync(bundlePath, 'utf-8'))
      this.cb(bundle)
    })
  }
}

class SendFilesClient {
  constructor(cb, ream) {
    this.cb = cb
    this.ream = ream
  }

  apply(compiler) {
    compiler.plugin('done', () => {
      const mfs = compiler.outputFileSystem
      const template = mfs.readFileSync(this.ream.resolveDist('client', 'index.html'), 'utf8')
      const clientManifest = JSON.parse(mfs.readFileSync(this.ream.resolveDist('client', 'vue-ssr-client-manifest.json'), 'utf8'))
      this.cb({ template, clientManifest })
    })
  }
}

module.exports = class RendererVue {
  constructor(opts) {
    this.opts = opts || {}
    this.appPath = path.join(__dirname, '../app')
  }

  apply(ream) {
    this.ream = ream
    handleWebpackConfig(this, 'server')
    handleWebpackConfig(this, 'client')

    ream.on('before-run', this.rendererPrepareRequests.bind(this))
  }

  createServerRenderer({ bundle, clientManifest, template }) {
    this.template = template
    this.serverRenderer = serverRenderer.createBundleRenderer(bundle, {
      runInNewContext: false,
      clientManifest,
      inject: false
    })
    return this
  }

  rendererPrepareRequests() {
    if (this.ream.dev) {
      const { serverConfig, clientConfig } = this.ream

      let bundle
      let clientManifest
      let template

      serverConfig.plugin('send-files')
        .use(SendFilesServer, [
          _bundle => {
            bundle = _bundle
            if (clientManifest) {
              this.createServerRenderer({
                bundle,
                clientManifest,
                template
              })
            }
          },
          this.ream
        ])

      clientConfig.plugin('send-files')
        .use(SendFilesClient, [
          res => {
            clientManifest = res.clientManifest
            template = res.template
            if (bundle) {
              this.createServerRenderer({
                bundle,
                clientManifest,
                template
              })
            }
          },
          this.ream
        ])
    } else {
      const bundle = require(this.ream.resolveDist('server', 'vue-ssr-server-bundle.json'))
      const template = fs.readFileSync(this.ream.resolveDist('client', 'index.html'), 'utf8')
      const clientManifest = require(this.ream.resolveDist('client', 'vue-ssr-client-manifest.json'))

      this.createServerRenderer({
        bundle,
        template,
        clientManifest
      })
    }
  }

  renderToString(route) {
    const context = {
      url: route,
      dev: false,
      data: {}
    }

    return new Promise((resolve, reject) => {
      this.serverRenderer.renderToString(context, (err, html) => {
        if (err) return reject(err)
        const { start, end } = renderTemplate(this.template, context)
        resolve(start + html + end)
      })
    })
  }

  async rendererHandleRequests(req, res) {
    if (!this.serverRenderer) {
      return res.end('wait for compiling...')
    }

    const context = {
      req,
      url: req.url,
      dev: this.ream.dev,
      initialData: {}
    }

    try {
      const html = await this.serverRenderer.renderToString(context)
      const splitContent = renderTemplate(this.template, context)

      if (context.error && context.error.statusCode) {
        res.statusCode = context.error.statusCode
      }

      res.write(splitContent.start)
      res.write(html)
      res.end(splitContent.end)
    } catch (err) {
      console.error(err.stack)
      res.end(this.ream.dev ? err.stack : 'server error')
    }
  }
}
