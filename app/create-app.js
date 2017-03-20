import Vue from 'vue'
import DefaultApp from './App.vue'

export default ({
  App = DefaultApp,
  store,
  router
}) => new Vue({
  store,
  router,
  render: h => h(App)
})
