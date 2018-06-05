const path = require('path')
const fs = require('fs-extra')
const sortBy = require('lodash.sortby')

module.exports = async (api, pagesDir) => {
  const routes = await collectRoutes({
    dir: api.resolveBaseDir(pagesDir),
    componentPrefix: path.join('#base/', pagesDir),
    parentPath: '/'
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

async function collectRoutes({ dir, componentPrefix, parentPath }) {
  const records = []
  const recordsLookup = {}

  function addRecord(path, props) {
    if (!recordsLookup[path]) {
      const record = {
        path: filePathToRoutePath(path)
      }
      records.push(record)
      recordsLookup[path] = record
    }
    Object.assign(recordsLookup[path], props)
  }

  for (const name of await fs.readdir(dir)) {
    const fullName = path.join(dir, name)
    const stats = await fs.stat(fullName) // eslint-disable-line no-await-in-loop
    if (stats.isDirectory()) {
      addRecord(name, { dir: name })
    } else if (stats.isFile()) {
      const match = name.match(/(.*)\.(vue|jsx?|ts)$/i) // TODO: pull from webpack?
      if (match) {
        const baseName = match[1]
        const path = baseName.toLowerCase() === 'index' ? '' : baseName
        addRecord(path, { file: name })
      }
    }
  }

  const sortedRecords = sortBy(records, record => [
    record.path.indexOf(':') >= 0, // Dynamic routes go last
    record.path
  ])

  const routes = []

  for (const record of sortedRecords) {
    const fullRoutePath = parentPath
      ? path.join(parentPath, record.path)
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
          parentPath: ''
        })
      }
      routes.push(route)
    } else if (record.dir) {
      routes.push(
        // eslint-disable-next-line no-await-in-loop
        ...(await collectRoutes({
          dir: path.join(dir, record.dir),
          componentPrefix: path.join(componentPrefix, record.dir),
          parentPath: fullRoutePath
        }))
      )
    }
  }

  return routes
}

function filePathToRoutePath(path) {
  // Nuxt-compatible syntax: _item_id.vue
  // egoist suggested syntax: [item_id].vue
  return path.replace(/^_/, ':').replace(/\[(.*?)\]/g, ':$1')
}
