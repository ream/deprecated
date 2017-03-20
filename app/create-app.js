import Vue from 'vue'
import DefaultApp from './App.vue'
import Meta from 'vue-meta'

Vue.use(Meta, {
  keyName: 'head',
  attribute: 'data-unvue-head',
  ssrAttribute: 'data-unvue-head-rendered',
  tagIDKeyName: 'unvuehid'
})

export default ({
  App = DefaultApp,
  store,
  router
}) => new Vue({
  store,
  router,
  render: h => h(App)
})
