import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const Home = {
  render() {
    return <h1>Home</h1>
  }
}

const User = {
  render() {
    return <h1>{this.$route.params.name}</h1>
  }
}

const router = new Router({
  mode: 'history',
  routes: [{
    path: '/',
    component: Home
  }, {
    path: '/user/:name',
    component: User
  }]
})

export default { router }
