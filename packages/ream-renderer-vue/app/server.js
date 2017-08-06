import Vue from 'vue'
import createApp from './create-app'
import { handleAsyncData } from './utils'

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
        const { name, asyncData } = Component
        if (Component.asyncData) {
          const ctx = { route, store, req: context.req }
          return handleAsyncData({
            name,
            asyncData,
            scopeContext: { route, store, req: context.req },
            context
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
