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
            { this.text }
          </div>
        )
      },
      data() {
        return { text: 'home' }
      },
      mounted() {
        this.text = 'nope'
      }
    }
  }]
})

const handlers = [
  function ({ router, isServer, deliverData }) {
    if (isServer) {
      deliverData({foo: 123})
    }
    router.beforeEach((to, from, next) => {
      console.log(new Date)
      setTimeout(() => {
        console.log(new Date)
        next()
      }, 3000)
    })
  }
]

export default { router, handlers }
