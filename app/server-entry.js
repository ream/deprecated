import Vue from 'vue'
import createApp from './create-app'

export default context => {
  const dev = context.dev
  const s = dev && Date.now()

  return new Promise((resolve, reject) => {
    const { app, router, store } = createApp(context)

    router.push(context.url)

    router.onReady(() => {
      const route = router.currentRoute
      const matchedComponents = router.getMatchedComponents()
      Promise.all(matchedComponents.map((Component, index) => {
        if (Component.preFetch) {
          const ctx = { route, store, req: context.req }
          return Component.preFetch(ctx)
        }
      })).then(() => {
        if (store) {
          context.state = store.state
        }
        if (app.$meta) {
          context.meta = app.$meta()
        }
        resolve(app)
      }).catch(reject)
    })
  })
}
