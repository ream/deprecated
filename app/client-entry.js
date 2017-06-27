import './polyfills'
import Vue from 'vue'
import createApp from './create-app'
import { applyPreFetchData } from './utils'

const { app, router, store, root } = createApp()

const ream = window.__REAM__

// prime the store with server-initialized state.
// the state is determined during SSR and inlined in the page markup.
if (ream.state) {
  store.replaceState(ream.state)
}

// a global mixin that calls `preFetch` when a route component's params change
Vue.mixin({
  beforeRouteUpdate (to, from, next) {
    const { preFetch, name } = this.$options
    if (preFetch) {
      preFetch({
        store: this.$store,
        route: to
      }).then(data => applyPreFetchData(window.__REAM__, data, name))
        .then(next)
        .catch(next)
    } else {
      next()
    }
  }
})

router.onReady(() => {

 // Add router hook for handling preFetch.
 // Doing it after initial route is resolved so that we don't double-fetch
 // the data that we already have. Using router.beforeResolve() so that all
 // async components are resolved.
 router.beforeResolve((to, from, next) => {
   const matched = router.getMatchedComponents(to)
   const prevMatched = router.getMatchedComponents(from)

   // we only care about none-previously-rendered components,
   // so we compare them until the two matched lists differ
   let diffed = false
   const activated = matched.filter((c, i) => {
     return diffed || (diffed = (prevMatched[i] !== c))
   })

   if (!activated.length) {
     return next()
   }

   Promise.all(activated.map((Component, index) => {
     if (Component.preFetch) {
       return Component.preFetch({ store, route: to })
        .then(data => {
          const ream = window.__REAM__
          applyPreFetchData(ream, data, Component.name)
        })
     }
   })).then(() => {
     next()
   }).catch(next)
 })

 app.$mount(document.getElementById(root))
})
