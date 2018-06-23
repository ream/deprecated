const path = require('path')

const slash = input => {
  const isExtendedLengthPath = /^\\\\\?\\/.test(input)
  const hasNonAscii = /[^\u0000-\u0080]+/.test(input) // eslint-disable-line no-control-regex

  if (isExtendedLengthPath || hasNonAscii) {
    return input
  }

  return input.replace(/\\/g, '/')
}

const pathToId = file => {
  return path.basename(slash(file)).replace(/\W/g, '_')
}

module.exports = api => {
  const enhanceAppFiles = [...api.enhanceAppFiles].map((filepath, index) => ({
    id: `${pathToId(filepath)}_${index}`,
    filepath: slash(filepath)
  }))

  return `
  import Vue from 'vue'
  import Meta from 'vue-meta'
  import Router from 'vue-router'
  import _entry from '#out/entry'
  import { getRequireDefault } from '#app/utils'

  Vue.config.productionTip = false

  Vue.use(Router)

  Vue.use(Meta, {
    keyName: 'head',
    attribute: 'data-ream-head',
    ssrAttribute: 'data-ream-ssr',
    tagIDKeyName: 'rhid'
  })

  const enhanceApp = getRequireDefault(require('#app/enhance-app'))

  ${[...enhanceAppFiles]
    .map(file =>
      `
  const ${file.id} = getRequireDefault(require('${file.filepath}'))
  `.trim()
    )
    .join('\n')}

  export default context => {
    const entry = typeof _entry === 'function' ? _entry() : _entry
    if (context) {
      context.entry = entry
    }

    const rootOptions = {
      _isReamRoot: true,
      router: entry.router || new Router({ mode: 'history' })
    }
    const getInitialDataContextFns = [
      entry.getInitialDataContext
    ].filter(Boolean)
    const middlewares = [
      entry.middleware
    ].filter(Boolean)

    const event = new Vue()
    const enhanceContext = {
      rootOptions,
      entry,
      ssrContext: context,
      event,
      getInitialDataContext(fn) {
        getInitialDataContextFns.push(fn)
      },
      addMiddleware(fn) {
        middlewares.push(fn)
      }
    }

    enhanceApp(enhanceContext, context)

    ${[...enhanceAppFiles]
      .map(file =>
        `
    if (typeof ${file.id} === 'function') {
      ${file.id}(enhanceContext)
    }
    `.trim()
      )
      .join('\n')}

    if (entry.extendRootOptions) {
      entry.extendRootOptions(rootOptions)
    }

    const app = new Vue(rootOptions)

    return {
      app,
      router: rootOptions.router,
      entry,
      getInitialDataContextFns,
      event,
      dataStore: rootOptions.dataStore,
      middlewares
    }
  }

  `
}
