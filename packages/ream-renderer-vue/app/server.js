import Vue from 'vue'
import createApp from './create-app'
import { handleInitialData } from './utils'

export default async context => {
  const dev = context.dev
  const s = dev && Date.now()

  const { app, router, store } = createApp(context)

  router.push(context.url)

  const onReady = () =>
    new Promise((resolve, reject) => {
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
    app.$ream.error = context.error = {
      statusCode: 404,
      message: 'Page not found'
    }
    return app
  }

  let errorFile
  try {
    await Promise.all(
      matchedComponents.map((Component, index) => {
        const { name, getInitialData } = Component
        if (getInitialData) {
          const ctx = { route, store, req: context.req }
          return handleInitialData({
            name,
            getInitialData,
            scopeContext: { route, store, req: context.req },
            context
          }).catch(err => {
            errorFile = Component.__file
            throw err
          })
        }
      })
    )
  } catch (err) {
    app.$ream.error = context.error = {
      statusCode: 500,
      message: dev
        ? `error in getInitialData (${errorFile}):\n\n${err.stack}`
        : 'server error'
    }
    return app
  }

  if (store) {
    context.state = store.state
  }

  return app
}
