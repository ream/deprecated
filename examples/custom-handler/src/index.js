import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [{
    path: '/',
    component: {
      name: 'home',
      render() {
        return (
          <div>
            Home
          </div>
        )
      }
    }
  }]
})

const handlers = [
  function ({ router }) {
    router.beforeEach((to, from, next) => {
      setTimeout(() => {
        next()
      }, 3000)
    })
  }
]

export default { router, handlers }
