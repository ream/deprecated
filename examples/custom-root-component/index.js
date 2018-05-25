import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default () => ({
  root: () => import('./Root.vue'),
  router: new Router({
    mode: 'history',
    routes: [
      {
        path: '/',
        component: {
          render(h) {
            return h('h1', 'homepage')
          }
        }
      }
    ]
  })
})
