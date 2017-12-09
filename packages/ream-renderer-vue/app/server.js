import Vue from 'vue'
import createApp from './create-app'
import { handleInitialData } from './utils'

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
    const { name, getInitialData } = Component
    if (getInitialData) {
      const ctx = { route, store, req: context.req }
      return handleInitialData({
        name,
        getInitialData,
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
