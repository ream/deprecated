/* globals window */
import Vue from 'vue'
// eslint-disable-next-line import/no-unassigned-import
import './polyfills'
// eslint-disable-next-line import/no-unresolved
import createApp from '#create-app'
import { routerReady } from './utils'
import serverHelpers from './server-helpers'
import ReamError from './ReamError'

const {
  app,
  router,
  getInitialDataContextFns,
  event,
  dataStore,
  entry
} = createApp()

const getContext = context => {
  for (const fn of getInitialDataContextFns) {
    fn(context)
  }
  return context
}

const updateDataStore = (id, data) => {
  dataStore.setData(id, data)
}

const handleError = err => {
  if (err instanceof ReamError) {
    if (err.code === 'REDIRECT') {
      router.push(err.redirectURL)
    } else {
      app.setError(err)
    }
  } else {
    console.error(err)
  }
}

// A global mixin that calls `getInitialData` when a route component's params change
Vue.mixin({
  async beforeRouteUpdate(to, from, next) {
    try {
      const context = getContext({
        router,
        route: to
      })

      if (entry.middleware) {
        await entry.middleware(context)
      }

      const { getInitialData } = this.$options
      if (getInitialData) {
        const data = await getInitialData(context)
        updateDataStore(this.$initialDataKey, data)
        Object.assign(this, data)
      }
      next()
    } catch (err) {
      err.url = to.path
      handleError(err)
      next()
    }
  }
})

// Wait until router has resolved all async before hooks
// and async components...
async function main() {
  event.$emit('before-client-renderer')

  if (window.__REAM__.initialData) {
    dataStore.replaceState(window.__REAM__.initialData)
  }

  await routerReady(router)

  if (router.getMatchedComponents().length === 0) {
    throw new ReamError({ code: 404, url: router.currentRoute.path })
  }

  // Add router hook for handling getInitialData.
  // Doing it after initial route is resolved so that we don't double-fetch
  // the data that we already have. Using router.beforeResolve() so that all
  // async components are resolved.
  router.beforeResolve(async (to, from, next) => {
    const matched = router.getMatchedComponents(to)
    if (matched.length === 0) {
      app.setError({ code: 404, errorPath: to.path })
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
      const ctx = getContext({ route: to, router, ...serverHelpers })
      if (entry.middleware) {
        await entry.middleware(ctx)
      }
      await Promise.all(
        components.map(async c => {
          const data = await c.getInitialData(ctx)
          updateDataStore(c.initialDataKey, data)
        })
      )
      next()
    } catch (err) {
      err.errorPath = to.path
      handleError(err)
      next()
    }
  })
}

main()
  // eslint-disable-next-line promise/prefer-await-to-then
  .then(() => {
    app.$mount('#_ream')
  })
  .catch(err => {
    handleError(err)
    app.$mount('#_ream')
  })
