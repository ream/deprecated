import Vue from 'vue'
import DefaultApp from './App.vue'
import Meta from 'vue-meta'
import AsyncData from './async-data'

Vue.use(Meta, {
  keyName: 'head',
  attribute: 'data-unvue-head',
  ssrAttribute: 'data-unvue-head-rendered',
  tagIDKeyName: 'unvuehid'
})

Vue.use(AsyncData)

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
