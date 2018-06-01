const path = require('path')

module.exports = {
  name: 'builtin:pwa',
  apply(api) {
    const pwa = api.options.pwa !== false

    api.chainWebpack(config => {
      config.plugin('constants').tap(([options]) => [
        Object.assign(options, {
          __PWA_ENABLED__: JSON.stringify(pwa)
        })
      ])
    })

    if (pwa) {
      api.enhanceAppFiles.add(path.join(__dirname, 'pwa-inject.js'))

      api.hooks.add('onFinished', async type => {
        const { generateSW } = require('workbox-build')
        await generateSW({
          swDest: api.resolveOutDir(
            type === 'build' ? 'client/sw.js' : 'generated/_ream/sw.js'
          ),
          globDirectory:
            type === 'build'
              ? api.resolveOutDir('client')
              : api.resolveOutDir('generated'),
          globPatterns: [
            '**/*.{js,css,html,png,jpg,jpeg,gif,svg,woff,woff2,eot,ttf,otf}'
          ]
        })
      })
    }

    api.configureServer(app => {
      if (api.options.dev) {
        app.use(require('./noop-sw-middleware')())
      } else {
        app.use('/_ream/sw.js', (req, res, next) => {
          req.shouldCache = false
          next()
        })
      }
    })
  }
}
