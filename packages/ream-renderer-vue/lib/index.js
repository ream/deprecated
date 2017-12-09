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

  init(ream, { webpack }) {
    this.ream = ream

    if (webpack) {
      handleWebpackConfig(this, 'server')
      handleWebpackConfig(this, 'client')
    }

    ream.on('before-request', this.rendererPrepareRequests.bind(this))
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
      res.send(`
      <div class="ream-error">
        <pre><code><span class="ream-error-span">500</span> refresh this page when you fixed the error:\n\n${this.ream.dev ? err.stack : 'server error'}</code></pre>
      </div>
      <style>
      .ream-error {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 8px;
        background: white;
      }

      .ream-error pre {
        margin: 0;
      }

      .ream-error-span {
        background: red;
        padding: 2px 5px;
        border-radius: 3px;
        color: white;
      }
      </style>
      `)
    }
  }
}
