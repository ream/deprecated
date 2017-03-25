import Vue from 'vue'
import DefaultApp from './App.vue'
import Meta from 'vue-meta'
import AsyncData from './mixins/async-data'

Vue.use(Meta, {
  keyName: 'head',
  attribute: 'data-rehead',
  ssrAttribute: 'data-rehead-rendered',
  tagIDKeyName: 'rehid'
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
