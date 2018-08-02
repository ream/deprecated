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
          head: {
            link: [
              {
                rel: 'stylesheet',
                href: '/style.css'
              }
            ]
          },
          render(h) {
            return h('h1', 'homepage')
          }
        }
      }
    ]
  })
})
