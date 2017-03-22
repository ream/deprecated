import Vue from 'vue'
import Router from 'vue-router'

// import your markdown file as vue component
import Post from './md/Post.md'

// you can add some style here
// import some css file

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [{
    path: '/',
    component: Post
  }]
})

export default { router }
