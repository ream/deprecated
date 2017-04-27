import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const Home = {
  render() {
    return <h1>Home</h1>
  }
}

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
