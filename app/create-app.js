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

// Inject this.$asyncData
Vue.mixin({
  beforeCreate() {
    const { name, asyncData } = this.$options
    if (name === 'ream-root' || !asyncData) return

    if (process.env.NODE_ENV !== 'production' && !name) {
      Object.defineProperty(this, '$asyncData', {
        get() {
          console.error(`[REAM] Expect route component to have a unique name in order to use $asyncData!`)
        }
      })
      return
    }

    const namespace = `${this.$route.path}::${name}`
    const asyncDataStore = process.server ? this.$ssrContext.data.asyncData : window.__REAM__.data.asyncData
    this.$asyncData = asyncDataStore && asyncDataStore[namespace]
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
