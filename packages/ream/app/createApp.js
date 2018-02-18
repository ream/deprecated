import Vue from 'vue'
import Meta from 'vue-meta'
// eslint-disable-next-line import/no-unresolved
import entry from '#app-entry'

Vue.config.productionTip = false

Vue.use(Meta, {
  keyName: 'head',
  attribute: 'data-ream-head',
  ssrAttribute: 'data-ream-ssr',
  tagIDKeyName: 'rhid'
})

export default () => {
  let { router, store, root = 'router-view', extendAppOptions } = entry

  if (__DEV__) {
    if (!router) {
      throw new Error('You must export "router" in entry file!')
    }
  }

  router = typeof router === 'function' ? router() : router
  store = typeof store === 'function' ? store() : store

  const appOptions = {
    router,
    store,
    head: {
      title: 'Ream Application'
    }
  }
  if (extendAppOptions) {
    extendAppOptions(appOptions)
  }

  appOptions.render = h =>
    h(
      'div',
      {
        attrs: {
          id: '_ream'
        }
      },
      [h(root)]
    )

  const app = new Vue(appOptions)

  return {
    app,
    router,
    store
  }
}
