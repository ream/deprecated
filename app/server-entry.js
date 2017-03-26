import entry from '@alias/entry'
import createApp from './create-app'
import defaultHandler from './default-handler'

const { router, store, handlers = [] } = entry

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

  return new Promise((resolve, reject) => {
    const handlerContext = {
      store,
      router,
      deliverData,
      isDev: context.dev,
      isServer: true,
      handleError: reject
    }

    for (const handler of [defaultHandler, ...handlers]) {
      handler(handlerContext)
    }

    router.push(context.url)

    router.onReady(() => {
      context.meta = meta
      resolve(app)
    })
  })
}
