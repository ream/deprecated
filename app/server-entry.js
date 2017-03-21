import { App, router, store } from '@entry'
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
  const cache = context.preFetchCache

  return new Promise((resolve, reject) => {
    router.push(context.url)

    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()

      if (!matchedComponents.length) {
        return reject({ code: 404 })
      }

      Promise.all(matchedComponents.map(component => {
        const preFetch = component.preFetch
        const preFetchCache = component.preFetchCache && component.preFetchCache
        if (preFetch) {
          return preFetch({ store })
        }
        if (preFetchCache && component.name) {
          const key = context.url + '::' + component.name
          const cacheData = cache && cache.get(key)
          const handleCache = preFetchCache({ store, cache: cacheData })
          if (handleCache) {
            if (handleCache.then) {
              return handleCache.then(newCacheData => {
                if (newCacheData) {
                  cache && cache.set(key, newCacheData)
                }
              })
            }
            cache && cache.set(key, handleCache)
          }
        }
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
