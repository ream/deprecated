import Vue from 'vue'
import DefaultApp from './App.vue'
import Meta from 'vue-meta'
import { sync } from 'vuex-router-sync'
import AsyncDaya from './async-data'

Vue.use(Meta, {
  keyName: 'head',
  attribute: 'data-unvue-head',
  ssrAttribute: 'data-unvue-head-rendered',
  tagIDKeyName: 'unvuehid'
})

Vue.use(AsyncDaya)

export default ({
  App = DefaultApp,
  store,
  router
} = {}) => {
  if (store) {
    const { sync } = require('vuex-router-sync')
    sync(store, router)
  }

  return new Vue({
    store,
    router,
    render: h => h(App)
  })
}
