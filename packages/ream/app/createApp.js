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

export default async req => {
  let { router, store, root = 'router-view', extendRootOptions } = entry

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
    root = await root({ store, req })
    root = root.default || root
  }

  const rootOptions = {
    router,
    store
  }
  if (extendRootOptions) {
    extendRootOptions(rootOptions)
  }

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
    store
  }
}
