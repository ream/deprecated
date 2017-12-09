import Vue from 'vue'
import createApp from './create-app'
import { handleInitialData } from './utils'

const { app, router, store, root } = createApp()

const ream = window.__REAM__

// prime the store with server-initialized state.
// the state is determined during SSR and inlined in the page markup.
if (ream.state) {
  store.replaceState(ream.state)
}

if (ream.error) {
  app.$ream.error = ream.error
}

// Capture Vue errors
const defaultErrorHandler = Vue.config.errorHandler
Vue.config.errorHandler = (err, vm, info) => {
  if (defaultErrorHandler) {
    defaultErrorHandler(err, vm, info)
  }
  app.$ream.error = {
    statusCode: 500,
    message: process.isDev
      ? `error in ${info} (open devtools to see more details):\n\n${err.stack} `
      : 'server error'
  }
  if (process.isDev) {
    console.error(err.stack)
  }
}

// a global mixin that calls `getInitialData` when a route component's params change
Vue.mixin({
  beforeRouteUpdate(to, from, next) {
    // Reset error
    console.log('update')
    app.$ream.error = null

    const { getInitialData, name } = this.$options
    if (getInitialData) {
      const handled = handleInitialData({
        name,
        getInitialData,
        scopeContext: { store: this.$store, route: to },
        context: ream
      })
      if (handled && handled.then) {
        handled.then(next, next)
      }
    } else {
      next()
    }
  }
})

router.onReady(() => {
  // Add router hook for handling getInitialData.
  // Doing it after initial route is resolved so that we don't double-fetch
  // the data that we already have. Using router.beforeResolve() so that all
  // async components are resolved.
  router.beforeResolve((to, from, next) => {
    // Reset error
    app.$ream.error = null
    const matched = router.getMatchedComponents(to)
    const prevMatched = router.getMatchedComponents(from)

    // we only care about none-previously-rendered components,
    // so we compare them until the two matched lists differ
    let diffed = false
    const activated = matched.filter((c, i) => {
      return diffed || (diffed = prevMatched[i] !== c)
    })

    if (activated.length === 0) {
      app.$ream.error = { statusCode: 404, message: 'Page not found' }
      return next()
    }
    // app.$ream.error = null
    Promise.all(
      activated.map((Component, index) => {
        const { getInitialData, name } = Component
        if (getInitialData) {
          return handleInitialData({
            scopeContext: { store, route: to },
            context: ream,
            name,
            getInitialData
          })
        }
      })
    )
      .then(() => next())
      .catch(next)
  })

  app.$mount(document.getElementById(root))
})
