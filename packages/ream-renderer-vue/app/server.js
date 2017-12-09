import Vue from 'vue'
import createApp from './create-app'
import { handleAsyncData } from './utils'

export default async context => {
  const dev = context.dev
  const s = dev && Date.now()

  const { app, router, store } = createApp(context)

  router.push(context.url)

  const onReady = () => new Promise((resolve, reject) => {
    router.onReady(resolve, reject)
  })

  try {
    await onReady()
  } catch (err) {
    console.log(err)
  }

  const route = router.currentRoute
  const matchedComponents = router.getMatchedComponents()

  if (app.$meta) {
    context.meta = app.$meta()
  }

  if (matchedComponents.length === 0) {
    app.$ream.error = context.error = { statusCode: 404, statusMessage: 'Page not found' }
    return app
  }

  await Promise.all(matchedComponents.map((Component, index) => {
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
  }))

  if (store) {
    context.state = store.state
  }

  return app
}
