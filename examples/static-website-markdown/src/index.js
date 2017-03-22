import Vue from 'vue'
import Router from 'vue-router'

// Lazy-loading (i.e. code-split) your markdown file as vue component
const Post = resolve => import('./md/Post.md').then(resolve)

// You can add some style here
// Import some css file

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [{
    path: '/',
    component: Post
  }]
})

export default { router }
