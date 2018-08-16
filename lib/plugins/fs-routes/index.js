const path = require('path')
const writeRoutes = require('./write-routes')

module.exports = {
  name: 'builtin:fs-routes',
  apply(api) {
    if (api.config.fsRoutes) {
      api.enhanceAppFiles.add(path.join(__dirname, 'inject.js'))
      const fsRoutes = Object.assign(
        {
          baseDir: 'pages',
          basePath: '/',
          match: /\.(vue|js)$/i
        },
        api.config.fsRoutes
      )
      writeRoutes(api, 'routes.js', fsRoutes)
    }
  }
}
