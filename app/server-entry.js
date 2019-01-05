// eslint-disable-next-line import/no-unresolved
import createApp from '#app/create-app'
import ReamError from './ReamError'
import { routerReady, pageNotFound, runMiddlewares } from './utils'
import serverHelpers from './server-helpers'

// This exported function will be called by `bundleRenderer`.
// This is where we perform data-prefetching to determine the
// state of our application before actually rendering it.
// Since data fetching is async, this function is expected to
// return a Promise that resolves to the app instance.
export default async context => {
  context.globalState = {}
  const { req, res } = context
  const { app, dataStore, router, entry, event, middlewares } = createApp(
    context
  )

  router.push(req.url)

  await routerReady(router)

  const matchedComponents = router.getMatchedComponents()

  // No matched routes
  if (matchedComponents.length === 0) {
    if (res) {
      res.statusCode = 404
      context.reamError = pageNotFound(req.url)
    } else {
      throw new ReamError({
        code: 'NOT_FOUND',
        message: `Cannot find corresponding route component for ${req.url}`
      })
    }
  }

  const dataContext = {
    req,
    res,
    router,
    route: router.currentRoute,
    ...serverHelpers
  }
  await runMiddlewares(middlewares, dataContext)

  await Promise.all(
    matchedComponents.map(async Component => {
      if (typeof Component === 'function') {
        // Component created with Vue.extend
        Component = Component.options
      }
      const { getInitialData } = Component
      if (!getInitialData) return
      const initialData = await getInitialData(dataContext)
      if (initialData) {
        for (const key of Object.keys(initialData)) {
          // `undefined` value will be removed when `JSON.stringify` so we set it to `null` here
          if (initialData[key] === undefined) {
            initialData[key] = null
          }
        }
      }
      dataStore.setData(Component.initialDataKey, initialData)
    })
  )

  context.document = entry.document
  if (entry.getDocumentData) {
    const documentData = await entry.getDocumentData(dataContext)
    context.documentData = Object.assign({}, documentData)
  }

  if (app.$meta) {
    context.meta = app.$meta()
  }

  context.globalState.initialData = dataStore.getState()

  event.$emit('before-server-render')

  return app
}
