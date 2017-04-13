import Vue from 'vue'
import DefaultApp from './App.vue'
import Meta from 'vue-meta'

export default ({
  App = DefaultApp,
  store,
  router,
  meta = true
} = {}) => {
  if (meta) {
    Vue.use(Meta, {
      keyName: 'head',
      attribute: 'data-rehead',
      ssrAttribute: 'data-rehead-rendered',
      tagIDKeyName: 'rehid'
    })
  }

  if (store) {
    const { sync } = require('vuex-router-sync')
    sync(store, router)
  }

  return new Vue({
    store,
    router,
    created() {
      Vue.prototype.$ream = this
    },
    render: h => h(App)
  })
}
