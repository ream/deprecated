import Vue from 'vue'
import createApp from './create-app'

export default ssrContext => {
  const dev = ssrContext.dev
  const s = dev && Date.now()

  return new Promise((resolve, reject) => {
    const { app, router, store } = createApp(ssrContext)

    router.push(ssrContext.url)

    router.onReady(() => {
      const route = router.currentRoute
      const matchedComponents = router.getMatchedComponents()
      Promise.all(matchedComponents.map((Component, index) => {
        // delete Component._Ctor
        const ps = []
        const ctx = { route, store }
        if (Component.preFetch) {
          ps.push(Component.preFetch(ctx))
        }
        return Promise.all(ps)
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
