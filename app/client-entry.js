/* globals window */
import Vue from 'vue'
// eslint-disable-next-line import/no-unassigned-import
import './polyfills'
// eslint-disable-next-line import/no-unresolved
import createApp from '#create-app'
import { routerReady } from './utils'
import redirect from './redirect'

const { app, router, getInitialDataContextFns, event } = createApp()

const getContext = context => {
  for (const fn of getInitialDataContextFns) {
    fn(context)
  }
  return context
}

const updateDataStore = (file, data) => {
  app.$dataStore.setData(file, data)
}

// A global mixin that calls `getInitialData` when a route component's params change
Vue.mixin({
  async beforeRouteUpdate(to, from, next) {
    const { getInitialData, __file } = this.$options
    if (getInitialData) {
      try {
        const data = await getInitialData(
          getContext({
            router,
            route: to
          })
        )
        updateDataStore(__file, data)
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
  event.$emit('before-client-renderer')

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

    const components = activated.filter(c => c.getInitialData)

    try {
      const ctx = getContext({ route: to, router, redirect })
      await Promise.all(
        components.map(c =>
          c.getInitialData(ctx).then(data => {
            updateDataStore(c.__file, data)
          })
        )
      )
      next()
    } catch (err) {
      next(err)
    }
  })

  // Actually mount to DOM
  app.$mount('#_ream')
}

main().catch(console.error)
