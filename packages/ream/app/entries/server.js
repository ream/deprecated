import createApp from '../createApp'
import ReamError from '../ReamError'

const isDev = process.env.NODE_ENV !== 'production'

// This exported function will be called by `bundleRenderer`.
// This is where we perform data-prefetching to determine the
// state of our application before actually rendering it.
// Since data fetching is async, this function is expected to
// return a Promise that resolves to the app instance.
export default context => {
  return new Promise((resolve, reject) => {
    const s = isDev && Date.now()
    const { app, router, store } = createApp()

    const { url } = context
    // const { fullPath } = router.resolve(url).route

    // if (fullPath !== url) {
    //   return reject({ url: fullPath })
    // }

    // Set router's location
    router.push(url)

    // Wait until router has resolved possible async hooks
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()
      // No matched routes
      if (matchedComponents.length === 0) {
        return reject(
          new ReamError({
            code: 'ROUTE_COMPONENT_NOT_FOUND',
            message: `Cannot find corresponding route component for ${url}`
          })
        )
      }
      // Call fetchData hooks on components matched by the route.
      // A preFetch hook dispatches a store action and returns a Promise,
      // which is resolved when the action is complete and store state has been
      // updated.
      Promise.all(
        matchedComponents.map(
          ({ getInitialData }) =>
            getInitialData &&
            getInitialData({
              store,
              route: router.currentRoute
            })
        )
      )
        .then(() => {
          isDev &&
            console.log(`route component resolve in: ${Date.now() - s}ms`)
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
          resolve(app)
        })
        .catch(reject)
    }, reject)
  })
}
