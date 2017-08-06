const path = require('path')
const fs = require('fs-extra')
const serverRenderer = require('vue-server-renderer')
const PostCompilePlugin = require('post-compile-webpack-plugin')
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
    compiler.plugin('done', stats => {
      const mfs = compiler.outputFileSystem
      const bundlePath = this.ream.resolveDistPath('server', 'vue-ssr-server-bundle.json')
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
    compiler.plugin('done', stats => {
      const mfs = compiler.outputFileSystem
      const template = mfs.readFileSync(this.ream.resolveDistPath('client', 'index.html'), 'utf8')
      const clientManifest = JSON.parse(mfs.readFileSync(this.ream.resolveDistPath('client', 'vue-ssr-client-manifest.json'), 'utf8'))
      this.cb({ template, clientManifest })
    })
  }
}

module.exports = class RendererVue {
  constructor(opts) {
    this.opts = opts || {}
    this.appPath = path.join(__dirname, '../app')
  }

  rendererInit(ream) {
    this.ream = ream
    handleWebpackConfig(this, 'server')
    handleWebpackConfig(this, 'client')
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
      const bundle = require(this.ream.resolveDistPath('server', 'vue-ssr-server-bundle.json'))
      const template = fs.readFileSync(this.ream.resolveDistPath('client', 'index.html'), 'utf8')
      const clientManifest = require(this.ream.resolveDistPath('client', 'vue-ssr-client-manifest.json'))

      this.createServerRenderer({
        bundle,
        template,
        clientManifest
      })
    }
  }

  rendererHandleRequests(req, res) {
    if (!this.serverRenderer) {
      return res.end('wait for compiling...')
    }

    const context = {
      req,
      url: req.url,
      dev: this.ream.dev,
      data: {}
    }

    const renderStream = this.serverRenderer.renderToStream(context)

    let splitContent

    renderStream.once('data', () => {
      splitContent = renderTemplate(this.template, context)
      res.write(splitContent.start)
    })

    renderStream.on('data', chunk => {
      res.write(chunk)
    })

    renderStream.on('end', () => {
      res.end(splitContent.end)
    })

    renderStream.on('error', err => {
      res.end(err.stack)
    })
  }
}
