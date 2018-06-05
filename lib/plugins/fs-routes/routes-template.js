const path = require('path')
const fs = require('fs-extra')
const sortBy = require('lodash.sortby')

module.exports = async (api, options) => {
  const routes = await collectRoutes({
    dir: api.resolveBaseDir(options.path),
    componentPrefix: path.join('#base/', options.path),
    basePath: '/',
    options
  })

  return `export default ${renderRoutes(routes)}`
}

function renderRoutes(routes) {
  return `
  [
    ${routes
      .map(
        route => `
    {
      path: ${JSON.stringify(route.path)},
      component: () => import(${JSON.stringify(route.component)}),
      ${route.children ? `children: ${renderRoutes(route.children)}` : ``}
    }`
      )
      .join(',')}
  ]`
}

// index.vue -> /
// about.vue -> /about
// user.vue -> /user
// user/index.vue -> /user, child ''
// user/friends.vue -> /user, child 'friends'
// catalog/index.vue -> /catalog
// catalog/specials.vue -> /catalog/specials
// [path].vue -> /:path

class FileCollector {
  constructor() {
    this.records = []
    this.lookup = {}
  }

  add(path, props) {
    if (!this.lookup[path]) {
      this.lookup[path] = {
        path: filePathToRoutePath(path)
      }
      this.records.push(this.lookup[path])
    }
    Object.assign(this.lookup[path], props)
  }

  sortedRecords() {
    return sortBy(this.records, record => [
      record.path.indexOf(':') >= 0, // Dynamic routes go last
      record.path
    ])
  }
}

function filePathToRoutePath(path) {
  if (path.toLowerCase() === 'index') {
    return ''
  }
  return path.replace(/\[(.*?)\]/g, ':$1')
}

async function collectRoutes({ dir, componentPrefix, basePath, options }) {
  const collector = new FileCollector()

  for (const name of await fs.readdir(dir)) {
    if (name.match(/^[._]/)) {
      continue
    }
    const stats = await fs.stat(path.join(dir, name)) // eslint-disable-line no-await-in-loop
    if (stats.isDirectory()) {
      collector.add(name, { dir: name })
    } else if (stats.isFile()) {
      if (name.match(options.match)) {
        collector.add(path.basename(name, path.extname(name)), { file: name })
      }
    }
  }

  const routes = []

  for (const record of collector.sortedRecords()) {
    const fullRoutePath = basePath
      ? path.join(basePath, record.path)
      : record.path
    if (record.file) {
      const route = {
        path: fullRoutePath,
        component: path.join(componentPrefix, record.file)
      }
      if (record.dir) {
        // eslint-disable-next-line no-await-in-loop
        route.children = await collectRoutes({
          dir: path.join(dir, record.dir),
          componentPrefix: path.join(componentPrefix, record.dir),
          basePath: '',
          options
        })
      }
      routes.push(route)
    } else if (record.dir) {
      routes.push(
        // eslint-disable-next-line no-await-in-loop
        ...(await collectRoutes({
          dir: path.join(dir, record.dir),
          componentPrefix: path.join(componentPrefix, record.dir),
          basePath: fullRoutePath,
          options
        }))
      )
    }
  }

  return routes
}
