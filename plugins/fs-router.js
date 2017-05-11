const path = require('path')
const fs = require('fs-extra')
const chokidar = require('chokidar')
const glob = require('glob')
const _ = require('../lib/utils')

function writeRouter(cwd, to) {
  const pages = 'pages/**/*.{vue,js}'

  const build = () => {
    const files = glob.sync(pages, { cwd })
    const data = `/* eslint-disable */
    import Vue from 'vue'
    import Router from 'vue-router'

    Vue.use(Router)

    export default ({
      routerOptions = {},
      routeOptions = {},
      customRoutes = []
      } = {}) => {
      const routes = [${files.map(file => {
        const path = file.slice(5)
          .replace(/\.(vue|js)$/, '')
          .replace(/_/g, ':')
          .replace(/^\/index$/, '/')

        return `{
          ...(typeof routeOptions === 'function' ? routeOptions('${path}') : routeOptions),
          path: '${path}',
          component: () => import('@cwd/pages${file.slice(5)}')
        }`
      }).join(',')}]
      const router = new Router({
        ...routerOptions,
        mode: 'history',
        routes: [...routes, ...customRoutes]
      })
      return router
    }
    `
    fs.ensureDirSync(path.dirname(to))
    fs.writeFileSync(to, data, 'utf8')
  }

  let ready
  const watcher = chokidar.watch(pages, { cwd })
  watcher.on('ready', () => {
    ready = true
    build()
    // Tweak time for first build
    _.tweakTime(to)
  })
  watcher.on('add', () => {
    if (ready) {
      build()
    }
  })
  watcher.on('unlink', build)
}

module.exports = () => {
  return ctx => {
    const tmp = path.join(ctx.options.cwd, '.ream', `fs-router.js`)
    writeRouter(ctx.options.cwd, tmp)

    ctx.extendWebpack(config => {
      config.module
        .rule('js')
          .include
            .add(tmp)

      config.resolve
        .alias
          .set('@alias/fs-router', tmp)
    })
  }
}
