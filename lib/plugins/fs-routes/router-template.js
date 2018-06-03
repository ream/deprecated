const path = require('path')
const fs = require('fs-extra')

async function collectRoutes(pagesDir) {
  const files = []
  for (const name of await fs.readdir(pagesDir)) {
    const fullName = path.join(pagesDir, name)
    const stats = await fs.stat(fullName) // eslint-disable-line no-await-in-loop
    if (stats.isDirectory()) {
      // MVP: skip directories
    } else if (stats.isFile()) {
      const match = name.match(/(.*)\.(vue|jsx?|ts)$/i) // TODO: pull from webpack?
      if (match) {
        const baseName = match[1]
        const path = baseName.toLowerCase() === 'index' ? '' : baseName
        files.push({ name, path })
      }
    }
  }
  return files.map(file => ({
    path: '/' + file.path,
    component: file.name
  }))
}

module.exports = async (api, pagesDir) => {
  const routes = await collectRoutes(api.resolveBaseDir(pagesDir))

  if (routes.length === 0) {
    return `
    export default function () {
      // No routes found in ${pagesDir}
    }
    `
  }

  const importPrefix = path.join('#base/', pagesDir) + '/'

  return `
  import Router from 'vue-router'

  export default function () {
    return new Router({
      mode: 'history',
      routes: [
        ${routes
          .map(route =>
            `
        {
          path: ${JSON.stringify(route.path)},
          component: () => import(${JSON.stringify(
            importPrefix + route.component
          )})
        },
            `.trim()
          )
          .join('\n')}
      ]
    })
  }
  `
}
