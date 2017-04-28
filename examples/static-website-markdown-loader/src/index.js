import Vue from 'vue'
import Router from 'vue-router'


// You can add some style here
// Import some css file

Vue.use(Router)

const createRouter = () => new Router({
  mode: 'history',
  routes: [{
    path: '/',
    // Lazy-loading (i.e. code-split) your markdown file as vue component
    component: () => import('./md/Post.md')
  }, {
    path: '/foo.html',
    // Lazy-loading (i.e. code-split) your markdown file as vue component
    component: () => import('./md/Post.md')
  }]
})

export default { createRouter }
