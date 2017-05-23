import Vue from 'vue'
import createApp from './create-app'

export default ssrContext => {
  const dev = ssrContext.dev
  const s = dev && Date.now()

  return new Promise((resolve, reject) => {
    const { app, router, store } = createApp()

    router.push(ssrContext.url)

    router.onReady(() => {
      const route = router.currentRoute
      const matchedComponents = router.getMatchedComponents()
      Promise.all(matchedComponents.map((Component, index) => {
        if (Component.preFetch) {
          const ctx = { route, store, req: ssrContext.req }
          return Component.preFetch(ctx)
        }
      })).then(() => {
        if (store) {
          ssrContext.state = store.state
        }
        if (app.$meta) {
          ssrContext.meta = app.$meta()
        }
        resolve(app)
      }).catch(reject)
    })
  })
}
