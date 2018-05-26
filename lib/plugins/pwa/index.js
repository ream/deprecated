const path = require('path')

module.exports = {
  name: 'builtin:pwa',
  apply(api) {
    api.chainWebpack(config => {
      config.plugin('constants').tap(([options]) => [
        Object.assign(options, {
          __PWA_ENABLED__: JSON.stringify(Boolean(api.options.pwa))
        })
      ])
    })

    api.enhanceAppFiles.add(path.join(__dirname, 'pwa-inject.js'))

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

    api.hooks.add('onFinished', async type => {
      const { generateSW } = require('workbox-build')
      await generateSW({
        swDest: api.resolveDist('client/sw.js'),
        globDirectory:
          type === 'build'
            ? api.resolveDist('client')
            : api.resolveDist('generated'),
        globPatterns: [
          '**/*.{js,css,html,png,jpg,jpeg,gif,svg,woff,woff2,eot,ttf,otf}'
        ],
        modifyUrlPrefix: {
          '': type === 'build' ? '/_ream/' : ''
        }
      })
    })
  }
}
