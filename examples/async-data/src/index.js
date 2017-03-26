import Vue from 'vue'
import Router from 'vue-router'
import Home from './Home.vue'
import About from './About.vue'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [{
    path: '/',
    component: Home,
    children: [{
      path: 'lol',
      component: About
    }]
  }, {
    path: '/about',
    component: About
  }]
})

export default { router }
