import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default {
  router() {
    return new Router({
      mode: 'history',
      routes: [
        {
          path: '/',
          component: () => import('./Home.vue')
        },
        {
          path: '/secret',
          component: () => import('./Secret.vue')
        }
      ]
    })
  }
}
