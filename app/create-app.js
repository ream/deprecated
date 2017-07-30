import Vue from 'vue'
import Meta from 'vue-meta'
import entry from '@alias/entry'
import { sync } from 'vuex-router-sync'
import { warn } from './utils'

const meta = Object.assign({
  keyName: 'head',
  attribute: 'data-ream-head',
  ssrAttribute: 'data-ream-head-ssr',
  tagIDKeyName: 'vmid'
}, entry.meta)

Vue.use(Meta, meta)

Vue.mixin({
  beforeCreate() {
    if (this.$options.name === 'ream-root') return

    const name = `${this.$route.path}::${this.$options.name || 'default'}`

    const fetchedStore = process.server ? this.$ssrContext.data.fetchedStore : window.__REAM__.data.fetchedStore

    if (fetchedStore && fetchedStore[name]) {
      this.$fetched = fetchedStore[name]
    }
  }
})

export default context => {
  const root = entry.root || 'app'

  if (process.env.NODE_ENV !== 'production') {
    warn(
      typeof entry.createRouter === 'function',
      `Expected "createRouter" to be a function but got ${typeof entry.createRouter}`
    )
  }

  const router = entry.router ? entry.router : entry.createRouter(context)
  const store = entry.store ? entry.store : (entry.createStore && entry.createStore(context))

  if (store && router) {
    sync(store, router)
  }

  const app = new Vue({
    ...(entry.rootOptions || {}),
    name: 'ream-root',
    store,
    router,
    render: h => {
      return h('div', {
        attrs: {
          id: root
        }
      }, [h(entry.App || 'router-view')])
    }
  })

  return {
    app,
    router,
    store,
    root
  }
}
