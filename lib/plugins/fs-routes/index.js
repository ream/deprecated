const path = require('path')
const writeRoutes = require('./write-routes')

module.exports = {
  name: 'builtin:fs-routes',
  apply(api) {
    if (api.options.fsRoutes) {
      api.enhanceAppFiles.add(path.join(__dirname, 'inject.js'))
      writeRoutes(api, 'routes.js', api.options.fsRoutes)
    }
  }
}
