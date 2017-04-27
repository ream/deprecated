import Vue from 'vue'
import Meta from 'vue-meta'
import entry from '@alias/entry'

const meta = entry.meta || {
  keyName: 'head',
  attribute: 'data-ream-head',
  ssrAttribute: 'data-ream-head-ssr',
  tagIDKeyName: 'ream-head-id'
}

Vue.use(Meta, meta)

Vue.mixin({
  beforeRouteUpdate (to, from, next) {
    const { preFetch } = this.$options
    if (preFetch) {
      preFetch({
        store: this.$store,
        route: to
      }).then(next).catch(next)
    } else {
      next()
    }
  }
})

export default ssrContext => {
  const root = entry.root || '#app'
  const router = entry.createRouter()
  let store
  if (entry.createStore) {
    store = entry.createStore()
  }

  const app = new Vue({
    ssrContext,
    store,
    router,
    render: h => {
      return h('div', {
        attrs: {
          id: root.substring(1)
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
