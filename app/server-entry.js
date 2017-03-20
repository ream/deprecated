import { App, router, store } from '@cwd/src'
import createApp from './create-app'

const app = createApp({
  router,
  store,
  App
})

const isDev = process.env.NODE_ENV !== 'production'

const meta = app.$meta()

export default context => {
  const s = isDev && Date.now()

  return new Promise((resolve, reject) => {
    router.push(context.url)

    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()

      if (!matchedComponents.length) {
        return reject({ code: 404 })
      }

      Promise.all(matchedComponents.map(component => {
        return component.preFetch && component.preFetch({
          store
        })
      })).then(() => {
        isDev && console.log(`> Data pre-fetch: ${Date.now() - s}ms`)
        if (store) {
          context.state = store.state
        }
        context.meta = meta
        resolve(app)
      }).catch(reject)
    })
  })
}
