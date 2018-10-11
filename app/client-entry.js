/* globals window */
import Vue from 'vue'
// eslint-disable-next-line import/no-unassigned-import
import './polyfills'
// eslint-disable-next-line import/no-unresolved
import createApp from '#out/create-app'
import { routerReady, pageNotFound, runMiddlewares } from './utils'
import serverHelpers from './server-helpers'
import ReamError from './ReamError'

const {
  app,
  router,
  getInitialDataContextFns,
  event,
  dataStore,
  middlewares
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
    app.setError(err)
    return true
  }
  console.error(err)
  return false
}

const handleRouteGuardError = (err, next) => {
  if (err instanceof ReamError && err.code === 'REDIRECT') {
    const url = err.redirectURL
    if (/^(\w+:)?\/\//.test(url)) {
      window.location.assign(url)
      next(false)
    } else {
      next(url)
    }
  } else if (handleError(err)) {
    next()
  } else {
    next(false)
  }
}

router.beforeResolve(async (to, from, next) => {
  // Skip initial load on client-side
  if (!app.$clientRendered) return next()

  const matched = router.getMatchedComponents(to)
  if (matched.length === 0) {
    app.setError(pageNotFound(to.path))
    return next()
  }

  const prevMatched = router.getMatchedComponents(from)
  let diffed = false
  const activated = matched.filter((c, i) => {
    if (diffed) return diffed
    diffed = prevMatched[i] !== c
    return diffed
  })

  const components = activated
    .map(c => (typeof c === 'function' ? c.options : c))
    .filter(c => c.getInitialData)

  try {
    const ctx = getContext({ route: to, router, ...serverHelpers })
    await runMiddlewares(middlewares, ctx)
    await Promise.all(
      components.map(async c => {
        const data = await c.getInitialData(ctx)
        updateDataStore(c.initialDataKey, data)
      })
    )
    next()
  } catch (err) {
    err.errorPath = to.path
    handleRouteGuardError(err, next)
  }
})

// A global mixin that calls `getInitialData` when a route component's params change
Vue.mixin({
  async beforeRouteUpdate(to, from, next) {
    try {
      const context = getContext({
        router,
        route: to
      })

      await runMiddlewares(middlewares, context)

      const { getInitialData } = this.$options
      if (getInitialData) {
        const data = await getInitialData(context)
        updateDataStore(this.$initialDataKey, data)
        Object.assign(this, data)
      }
      next()
    } catch (err) {
      err.url = to.path
      handleRouteGuardError(err, next)
    }
  }
})

// Wait until router has resolved all async before hooks
// and async components...
async function main() {
  event.$emit('before-client-render')

  if (window.__REAM__.initialData) {
    dataStore.replaceState(window.__REAM__.initialData)
  }

  await routerReady(router)

  if (router.getMatchedComponents().length === 0) {
    throw new ReamError(pageNotFound(router.currentRoute.path))
  }
}

const mountApp = app => {
  app.$mount('#_ream')
  app.$clientRendered = true
}

main()
  // eslint-disable-next-line promise/prefer-await-to-then
  .then(() => {
    mountApp(app)
  })
  .catch(err => {
    if (handleError(err)) {
      mountApp(app)
    }
  })
