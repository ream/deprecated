import entry from '@alias/entry'
import createApp from './create-app'
import { setAsyncData } from './mixins/async-data'

const { router, store } = entry
const app = createApp(entry)

const isDev = process.env.NODE_ENV !== 'production'

const meta = app.$meta()

export default context => {
  const s = isDev && Date.now()
  const cache = context.cache

  if (!process.__CACHE) {
    process.__CACHE__ = cache
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
        let pipe = Promise.resolve()
        const { preFetch, preFetchCache, asyncData, name } = component

        if (preFetch) {
           pipe = pipe.then(() => preFetch({ store, route }))
        } else {
          if (preFetchCache && name) {
            const key = `preFetchCache:${name}:${route.fullPath}`
            const cacheData = cache && cache.get(key)
            context.preFetchCacheKeys.push(key)
            pipe = pipe.then(() => {
              return preFetchCache({ store, cache: cacheData, route }).then(newCacheData => {
                if (newCacheData) {
                  cache && cache.set(key, newCacheData)
                }
              })
            })
          }
        }

        if (asyncData && name) {
          pipe = pipe.then(() => {
            const data = asyncData({ store, route })
            const key = `asyncData:${name}:` + route.fullPath
            context.asyncDataKeys.push(key)
            if (data.then) {
              return data.then(newCacheData => {
                if (newCacheData) {
                  cache && cache.set(key, newCacheData)
                }
              })
            }
          })
        }

        return pipe
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
