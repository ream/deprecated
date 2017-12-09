import Vue from 'vue'
import Meta from 'vue-meta'
import entry from 'entry-of-user-app'
import { sync } from 'vuex-router-sync'
import { warn } from './utils'
import DefaultRootComponent from './components/Root'
import InstallMixins from './mixins'

const meta = Object.assign({
  keyName: 'head',
  attribute: 'data-ream-head',
  ssrAttribute: 'data-ream-head-ssr',
  tagIDKeyName: 'vmid'
}, entry.meta)

Vue.use(Meta, meta)
Vue.use(InstallMixins)

const RootComponent = entry.RootComponent || DefaultRootComponent

export default context => {
  // Should give this a better name, like `rootId`
  const root = entry.root || 'ream-root'

  const router = entry.router || entry.createRouter(context)

  const store = entry.store || (entry.createStore && entry.createStore(context))

  if (store && router) {
    sync(store, router)
  }

  const app = new Vue({
    ...(entry.rootOptions || {}),
    name: 'ream-root',
    store,
    router,
    ream: {
      error: null
    },
    beforeCreate () {
      Vue.util.defineReactive(this, '$ream', this.$options.ream)
    },
    render: h => {
      return h('div', {
        attrs: {
          id: root
        }
      }, [h(RootComponent)])
    }
  })

  return {
    app,
    router,
    store,
    root
  }
}
