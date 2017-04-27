import Vue from 'vue'
import Router from 'vue-router'
import Home from './Home.vue'
import './style.css'
Vue.use(Router)

const About = {
  render() {
    return <h1>About</h1>
  }
}

const createRouter = () => new Router({
  mode: 'history',
  routes: [{
    path: '/',
    component: Home
  }, {
    path: '/about',
    component: About
  }]
})

export default { createRouter }
