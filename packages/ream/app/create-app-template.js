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
  // eslint-disable-next-line import/no-unresolved
  import _entry from '#app-entry'

  Vue.config.productionTip = false

  ${[...enhanceAppFiles]
    .map(file =>
      `
  import ${file.id} from '${file.filepath}'
  `.trim()
    )
    .join('\n')}

  Vue.use(Meta, {
    keyName: 'head',
    attribute: 'data-ream-head',
    ssrAttribute: 'data-ream-ssr',
    tagIDKeyName: 'rhid'
  })

  export default async context => {
    const entry = typeof _entry === 'function' ? _entry() : _entry
    let { router, store, root = 'router-view', extendRootOptions } = entry
    if (context) {
      context.entry = entry
    }


    if (__DEV__) {
      if (!router) {
        throw new Error('You must export "router" in entry file!')
      }
    }
    router = router()
    if (store) {
      store = store()
    }

    if (typeof root === 'function') {
      root = await root({ store, req: context && context.req })
      root = root.default || root
    }

    const rootOptions = {
      router,
      store
    }
    if (extendRootOptions) {
      extendRootOptions(rootOptions)
    }

    const enhanceContext = { router, store, rootOptions }
    ${[...enhanceAppFiles]
      .map(file =>
        `
    if (typeof ${file.id} === 'function') {
      ${file.id}(enhanceContext)
    }
    `.trim()
      )
      .join('\n')}

    rootOptions.render = h =>
      h(
        'div',
        {
          attrs: {
            id: '_ream'
          }
        },
        [h(root)]
      )

    const app = new Vue(rootOptions)

    return {
      app,
      router,
      store,
      entry
    }
  }

  `
}
