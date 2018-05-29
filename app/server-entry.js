// eslint-disable-next-line import/no-unresolved
import createApp from '#create-app'
import ReamError from './ReamError'
import { routerReady, pageNotFound } from './utils'
import serverHelpers from './server-helpers'

// This exported function will be called by `bundleRenderer`.
// This is where we perform data-prefetching to determine the
// state of our application before actually rendering it.
// Since data fetching is async, this function is expected to
// return a Promise that resolves to the app instance.
export default async context => {
  context.globalState = {}
  const { req, res } = context
  const {
    app,
    dataStore,
    router,
    entry,
    getInitialDataContextFns,
    event
  } = createApp(context)

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

  for (const fn of getInitialDataContextFns) {
    fn(dataContext)
  }

  if (entry.middleware) {
    await entry.middleware(dataContext)
  }

  if (entry.getDocumentData) {
    const documentData = await entry.getDocumentData(dataContext)
    context.documentData = Object.assign({}, documentData)
  }

  await Promise.all(
    matchedComponents.map(async Component => {
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

  if (app.$meta) {
    context.meta = app.$meta()
  }

  context.globalState.initialData = dataStore.getState()

  event.$emit('before-server-render')

  return app
}
