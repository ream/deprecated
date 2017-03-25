import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const About = {
  data() {
    return {
      msg: 'no'
    }
  },
  name: 'about',
  asyncData() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({msg: 'yes!!'})
      }, 400)
    })
  },
  render() {
    return <h1>About {this.msg}</h1>
  }
}

const Home = {
  data() {
    return {
      text: 'original'
    }
  },
  asyncData() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({text: 'changed!!'})
      }, 400)
    })
  },
  render() {
    return <div>
      <router-link to="/about">goto about</router-link>
      {this.text}
    </div>
  }
}

const router = new Router({
  mode: 'history',
  routes: [{
    path: '/',
    component: Home
  }, {
    path: '/about',
    component: About
  }]
})

export default { router }
