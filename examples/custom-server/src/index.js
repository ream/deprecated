import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const Home = {
  render() {
    return <h1>Home</h1>
  }
}

const router = new Router({
  mode: 'history',
  routes: [{
    path: '/',
    component: Home
  }]
})

export { router }
