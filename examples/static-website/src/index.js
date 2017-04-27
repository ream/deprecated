import Vue from 'vue'
import Router from 'vue-router'
import logo from './images/logo.png'

Vue.use(Router)

const Home = {
  render() {
    return <div>
    <h1>Home</h1>
    <img src={logo} />
    </div>
  }
}

const User = {
  render() {
    return <h1>{this.$route.params.name}</h1>
  }
}

const createRouter = () => new Router({
  mode: 'history',
  routes: [{
    path: '/',
    component: Home
  }, {
    path: '/user/:name',
    component: User
  }]
})

export default { createRouter }
