import Vue from 'vue'
import createApp from './create-app'
import { applyFetchData } from './utils'

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
        if (Component.fetch) {
          const ctx = { route, store, req: context.req }
          return Component.fetch(ctx).then(data => {
            applyFetchData(context, data, route, Component)
          })
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
