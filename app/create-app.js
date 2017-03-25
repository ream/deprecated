import Vue from 'vue'
import DefaultApp from './App.vue'
import Meta from 'vue-meta'

Vue.use(Meta, {
  keyName: 'head',
  attribute: 'data-rehead',
  ssrAttribute: 'data-rehead-rendered',
  tagIDKeyName: 'rehid'
})

let app

export default ({
  App = DefaultApp,
  store,
  router
} = {}) => {
  if (app) return app

  if (store) {
    const { sync } = require('vuex-router-sync')
    sync(store, router)
  }

  app = new Vue({
    store,
    router,
    render: h => h(App)
  })

  return app
}
