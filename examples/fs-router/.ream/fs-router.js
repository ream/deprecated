/* eslint-disable */
    import Vue from 'vue'
    import Router from 'vue-router'

    Vue.use(Router)

    export default ({
      routerOptions = {},
      routeOptions = {},
      customRoutes = []
      } = {}) => {
      const routes = [{
          ...(typeof routeOptions === 'function' ? routeOptions('/about') : routeOptions),
          path: '/about',
          component: resolve => import('@cwd/pages/about.vue').then(resolve)
        },{
          ...(typeof routeOptions === 'function' ? routeOptions('/') : routeOptions),
          path: '/',
          component: resolve => import('@cwd/pages/index.vue').then(resolve)
        }]
      const router = new Router({
        ...routerOptions,
        mode: 'history',
        routes: [...routes, ...customRoutes]
      })
      return router
    }
    