import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const Home = resolve => import('./Home.vue').then(resolve)

const router = new Router({
  mode: 'history',
  routes: [{
    path: '/',
    component: Home
  }]
})

export default { router }
