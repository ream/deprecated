const path = require('path')
const fs = require('fs-extra')
const chokidar = require('chokidar')
const debounce = require('lodash.debounce')
const Mutex = require('promise-mutex')

module.exports = async function(api, moduleName, options) {
  const { path: pagesPath, basePath, ...routeOptions } = options
  const pagesDir = api.resolveBaseDir(pagesPath)
  const moduleFile = api.resolveOutDir(moduleName)

  const collectOptions = {
    dir: pagesDir,
    componentPrefix: path.join('#base', pagesPath),
    basePath
  }

  const writeFile = async () => {
    return fs.writeFile(
      moduleFile,
      await require('./routes-template')(collectOptions, routeOptions)
    )
  }

  api.hooks.add('onPrepareFiles', async () => {
    await writeFile()
    if (api.options.dev) {
      const mutex = new Mutex()
      chokidar
        .watch(pagesDir, {
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
