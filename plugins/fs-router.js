const path = require('path')
const os = require('os')
const fs = require('fs')
const chokidar = require('chokidar')
const glob = require('glob')

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
          component: resolve => import('@cwd/pages${file.slice(5)}').then(resolve)
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
    fs.writeFileSync(to, data, 'utf8')
  }

  let ready
  const watcher = chokidar.watch(pages, { cwd })
  watcher.on('ready', () => {
    ready = true
    build()
  })
  watcher.on('add', () => {
    if (ready) {
      build()
    }
  })
  watcher.on('unlink', build)
}

module.exports = () => {
  const tmp = path.join(os.tmpdir(), `fs-router-${Date.now()}.js`)
  return ctx => {
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
