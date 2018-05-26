// eslint-disable-next-line import/no-unresolved
import createApp from '#create-app'
import ReamError from './ReamError'
import { routerReady } from './utils'

// This exported function will be called by `bundleRenderer`.
// This is where we perform data-prefetching to determine the
// state of our application before actually rendering it.
// Since data fetching is async, this function is expected to
// return a Promise that resolves to the app instance.
export default async context => {
  const { req } = context
  const { app, router, store, entry } = createApp(context)

  router.push(req.url)

  await routerReady(router)

  const matchedComponents = router.getMatchedComponents()

  // No matched routes
  if (matchedComponents.length === 0) {
    throw new ReamError({
      code: 'ROUTE_COMPONENT_NOT_FOUND',
      message: `Cannot find corresponding route component for ${req.url}`
    })
  }

  const dataContext = {
    req,
    store,
    router,
    route: router.currentRoute
  }

  if (entry.getInitialDataContext) {
    entry.getInitialDataContext(dataContext)
  }

  if (entry.getDocumentData) {
    const documentData = await entry.getDocumentData(dataContext)
    context.documentData = Object.assign({}, documentData)
  }

  // Call fetchData hooks on components matched by the route.
  // A preFetch hook dispatches a store action and returns a Promise,
  // which is resolved when the action is complete and store state has been
  // updated.
  await Promise.all(
    matchedComponents.map(
      ({ getInitialData }) => getInitialData && getInitialData(dataContext)
    )
  )

  // After all preFetch hooks are resolved, our store is now
  // filled with the state needed to render the app.
  // Expose the state on the render context, and let the request handler
  // inline the state in the HTML response. This allows the client-side
  // store to pick-up the server-side state without having to duplicate
  // the initial data fetching on the client.
  if (store) {
    context.state = store.state
  }
  if (app.$meta) {
    context.meta = app.$meta()
  }

  return app
}
