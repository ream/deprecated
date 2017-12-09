import Vue from 'vue'
import Router from 'vue-router'
import Home from './Home.vue'
import About from './About.vue'
import ErrorComponent from './Error.vue'

Vue.use(Router)

const createRouter = () => new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/about',
      component: About
    }
  ]
})

export default {
  createRouter,
  // ErrorComponent
}
