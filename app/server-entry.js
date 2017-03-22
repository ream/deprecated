import entry from '@entry'
import createApp from './create-app'

const { router, store } = entry
const app = createApp(entry)

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
        let pipe = Promise.resolve()
        const preFetch = component.preFetch

        if (preFetch) {
           pipe = pipe.then(() => preFetch({ store }))
        } else {
          const preFetchCache = component.preFetchCache
          if (preFetchCache && component.name) {
            const key = context.url + '::' + component.name
            const cacheData = cache && cache.get(key)
            pipe = pipe.then(() => {
              return preFetchCache({ store, cache: cacheData }).then(newCacheData => {
                if (newCacheData) {
                  cache && cache.set(key, newCacheData)
                }
              })
            })
          }
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
