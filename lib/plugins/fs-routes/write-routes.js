const fs = require('fs-extra')
const chokidar = require('chokidar')
const debounce = require('lodash.debounce')
const Mutex = require('promise-mutex')

module.exports = async function(api, moduleName, options) {
  const mutex = new Mutex()

  const writeFile = async () => {
    return fs.writeFile(
      api.resolveOutDir(moduleName),
      await require('./routes-template')(api, options)
    )
  }

  api.hooks.add('onPrepareFiles', async () => {
    await writeFile()
    if (api.options.dev) {
      chokidar
        .watch(api.resolveBaseDir(options.path), {
          disableGlobbing: true,
          ignoreInitial: true
        })
        .on(
          'all',
          debounce(() => {
            mutex.lock(writeFile)
          }, 500)
        )
    }
  })
}
