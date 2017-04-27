import './polyfills'
import Vue from 'vue'
import createApp from './create-app'

const { app, router, store, root } = createApp()

const ream = window.__REAM__

router.onReady(() => {
  if (ream.state) {
    store.replaceState(ream.state)
  }
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

   // this is where we should trigger a loading indicator if there is one

   Promise.all(activated.map((Component, index) => {
     if (Component.preFetch) {
       return Component.preFetch({ store, route: to })
     }
   })).then(() => {

     // stop loading indicator

     next()
   }).catch(next)
 })

 app.$mount(root)
})
