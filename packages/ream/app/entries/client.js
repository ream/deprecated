/* globals window */
import Vue from 'vue'
// eslint-disable-next-line import/no-unassigned-import
import 'es6-promise/auto'
// eslint-disable-next-line import/no-unresolved
import createApp from '#create-app'
import { routerReady } from '../utils'

// A global mixin that calls `getInitialData` when a route component's params change
Vue.mixin({
  beforeRouteUpdate(to, from, next) {
    const { getInitialData } = this.$options
    if (getInitialData) {
      getInitialData({
        store: this.$store,
        route: to
      })
        .then(next)
        .catch(next)
    } else {
      next()
    }
  }
})

// Wait until router has resolved all async before hooks
// and async components...
async function main() {
  const { app, router, store } = await createApp()

  // Prime the store with server-initialized state.
  // the state is determined during SSR and inlined in the page markup.
  if (window.__REAM__.state && store) {
    store.replaceState(window.__REAM__.state)
  }

  await routerReady(router)

  // Add router hook for handling getInitialData.
  // Doing it after initial route is resolved so that we don't double-fetch
  // the data that we already have. Using router.beforeResolve() so that all
  // async components are resolved.
  router.beforeResolve((to, from, next) => {
    const matched = router.getMatchedComponents(to)
    const prevMatched = router.getMatchedComponents(from)
    let diffed = false
    const activated = matched.filter((c, i) => {
      if (diffed) return diffed
      diffed = prevMatched[i] !== c
      return diffed
    })
    const getInitialDataHooks = activated
      .map(c => c.getInitialData)
      .filter(_ => _)
    if (getInitialDataHooks.length > 0) {
      return next()
    }

    Promise.all(getInitialDataHooks.map(hook => hook({ store, route: to })))
      .then(() => {
        next()
      })
      .catch(next)
  })

  // Actually mount to DOM
  app.$mount('#_ream')
}

main().catch(console.error)
