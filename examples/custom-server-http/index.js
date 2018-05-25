import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default () => ({
  router: new Router({
    mode: 'history',
    routes: [
      {
        path: '/',
        component: {
          render: h => h('h1', 'hello world')
        }
      }
    ]
  })
})
