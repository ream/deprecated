const path = require('path')
const fs = require('fs-extra')

module.exports = {
  name: 'builtin:fs-routes',
  apply(api) {
    if (
      api.options.fsRoutes &&
      fs.existsSync(api.resolveBaseDir(api.options.fsRoutes.path))
    ) {
      api.enhanceAppFiles.add(path.join(__dirname, 'inject.js'))

      api.hooks.add('onPrepareFiles', async () => {
        await fs.writeFile(
          api.resolveOutDir('router.js'),
          await require('./router-template')(api, api.options.fsRoutes.path)
        )
      })
    }
  }
}