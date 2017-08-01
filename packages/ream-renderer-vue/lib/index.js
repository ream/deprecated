const path = require('path')
const fs = require('fs-extra')
const serverRenderer = require('vue-server-renderer')
const PostCompilePlugin = require('post-compile-webpack-plugin')
const handleWebpackConfig = require('./handle-config')

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

  init(ream) {
    this.ream = ream
    handleWebpackConfig(this, 'server')
    handleWebpackConfig(this, 'client')
  }


  createServerRenderer({ bundle, clientManifest, template }) {
    this.serverRenderer = serverRenderer.createBundleRenderer(bundle, {
      runInNewContext: false,
      clientManifest,
      template
    })
    return this
  }

  prepare() {
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

  handleRequests(req, res) {
    if (!this.serverRenderer) {
      this.createServerRenderer()
      return res.end('wait for compiling...')
    }

    const context = { req }

    const stream = this.serverRenderer.renderToStream(context)

    stream.on('data', chunk => {
      res.write(chunk)
    })

    stream.on('end', () => {
      res.end()
    })

    stream.on('error', err => {
      res.end(err.stack)
    })
  }
}
