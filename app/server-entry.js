import entry from '@alias/entry'
import createApp from './create-app'

const { router, store, handlers } = entry

const app = createApp(entry)

const meta = app.$meta()

export default context => {
  const dev = context.dev
  const s = dev && Date.now()

  // We will inline `data` into HTML markup
  // Just like what we do for Vuex state
  const deliverData = data => {
    if (data) {
      for (const key in data) {
        context.data[key] = data[key]
      }
    }
  }

  const handlerContext = {
    store,
    router,
    deliverData,
    isDev: context.dev,
    isServer: true
  }

  if (handlers) {
    for (const handler of handlers) {
      handler(handlerContext)
    }
  }

  return new Promise((resolve, reject) => {
    router.push(context.url)
    const route = router.currentRoute

    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()

      if (!matchedComponents.length) {
        return reject({ code: 404 })
      }

      Promise.all(matchedComponents.map(component => {
        const { preFetch } = component

        if (preFetch) {
           return preFetch({ store, route })
        }
      })).then(() => {
        dev && console.log(`> Data pre-fetch: ${Date.now() - s}ms`)
        if (store) {
          context.state = store.state
        }
        context.meta = meta
        resolve(app)
      }).catch(reject)
    })
  })
}
