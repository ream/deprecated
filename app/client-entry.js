/* globals window */
import Vue from 'vue'
// eslint-disable-next-line import/no-unassigned-import
import './polyfills'
// eslint-disable-next-line import/no-unresolved
import createApp from '#create-app'
import { routerReady } from './utils'
import redirect from './redirect'

const { app, router, store, entry } = createApp()

const getContext = context => {
  if (entry.getInitialDataContext) {
    entry.getInitialDataContext(context)
  }
  return context
}

// A global mixin that calls `getInitialData` when a route component's params change
Vue.mixin({
  async beforeRouteUpdate(to, from, next) {
    const { getInitialData } = this.$options
    if (getInitialData) {
      try {
        await getInitialData(
          getContext({
            router,
            store: this.$store,
            route: to
          })
        )
        next()
      } catch (err) {
        next(err)
      }
    } else {
      next()
    }
  }
})

// Wait until router has resolved all async before hooks
// and async components...
async function main() {
  // Prime the store with server-initialized state.
  // the state is determined during SSR and inlined in the page markup.
  if (window.__REAM__.state && store) {
    store.replaceState(window.__REAM__.state)
  }

  if (window.__REAM__.initialData) {
    app.$dataStore.replaceState(window.__REAM__.initialData)
  }

  await routerReady(router)

  if (router.getMatchedComponents().length === 0) {
    app.setError({ code: 404, url: router.currentRoute.path })
  }

  // Add router hook for handling getInitialData.
  // Doing it after initial route is resolved so that we don't double-fetch
  // the data that we already have. Using router.beforeResolve() so that all
  // async components are resolved.
  router.beforeResolve(async (to, from, next) => {
    const matched = router.getMatchedComponents(to)
    if (matched.length === 0) {
      app.setError({ code: 404, url: to.path })
      return next()
    }

    app.setError(null)

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

    try {
      const ctx = getContext({ store, route: to, router, redirect })
      await Promise.all(getInitialDataHooks.map(hook => hook(ctx)))
      next()
    } catch (err) {
      next(err)
    }
  })

  // Actually mount to DOM
  app.$mount('#_ream')
}

main().catch(console.error)
