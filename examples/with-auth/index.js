import Vue from 'vue'
import Router from 'vue-router'
import getToken from './lib/getToken'

Vue.use(Router)

export default () => ({
  router: new Router({
    mode: 'history',
    routes: [
      {
        path: '/',
        component: () => import('./views/Home.vue')
      },
      {
        path: '/secret',
        meta: {
          requireLogin: true
        },
        component: () => import('./views/Secret.vue')
      },
      {
        path: '/login',
        component: () => import('./views/Login.vue')
      }
    ]
  }),
  async middleware({ route, req, redirect, error }) {
    if (route.meta.requireLogin) {
      const token = getToken(req)
      if (!token) {
        // Always redirect to /login for unauthed request
        redirect('/login')

        // Or redirect for server-side request
        // But continue with error message for client-side request
        // if (process.server) {
        //   redirect('/login')
        // } else {
        //   error({ code: 403, message: 'unauthroized' })
        // }
      }
    }
  }
})
