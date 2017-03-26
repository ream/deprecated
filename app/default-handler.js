import Vue from 'vue'
import { getMatchedComponents } from './utils'

export default ({
  router,
  store,
  deliverData,
  isServer,
  isClient,
  handleError
}) => {
  router.beforeEach((to, from, next) => {
    let Components = getMatchedComponents(to.matched)

    if (!Components.length) {
      return handleError({ code: 404 })
    }

    const route = router.currentRoute

    const applyData = (component, asyncData) => {
      const data = component.options.data ? component.options.data() : {}
      component.options.data = () => ({...data, ...asyncData})
      component._Ctor.options.data = component.options.data
    }

    Promise.all(Components.map(Component => {
      return new Promise((resolve, reject) => {
        const touchComponent = Component => {
          if (!Component.options) {
            Component = Vue.extend(Component)
            Component._Ctor = Component
          } else {
            Component._Ctor = Component
            Component.extendOptions = Component.options
          }
          resolve(Component)
        }
        if (typeof Component === 'function') {
          return Component().then(touchComponent).catch(reject)
        }
        touchComponent(Component)
      })
    })).then(Components => {
      const ps = []

      for (const Component of Components) {
        if (Component.options.asyncData) {
          if (isClient && window.__REAM__.data.asyncData) {
            const data = window.__REAM__.data.asyncData
            applyData(Component, data)
            window.__REAM__.data.asyncData = null
          } else {
            const asyncData = Component.options.asyncData({
              store,
              route,
              isServer,
              isClient
            })
            if (asyncData.then) {
              ps.push(asyncData.then(data => {
                applyData(Component, data)
                isServer && deliverData({ asyncData: data })
              }))
            } else {
              applyData(Component, asyncData)
            }
          }
        }

        if (Component.options.preFetch) {
          const shouldFetchOnClientSide = isClient && !window.__REAM__.data.__state
          if (isServer || shouldFetchOnClientSide) {
            const preFetch = Component.options.preFetch
            ps.push(preFetch({
              store,
              route,
              isServer,
              isClient
            }))
          }
        }
      }

      return Promise.all(ps)
    }).then(() => {
      isServer && store && deliverData({ __state: store.state })
      next()
    }).catch(handleError)
  })

  if (isClient && store) {
    const state = window.__REAM__.data.__state
    if (state) {
      store.replaceState(state)
      window.__REAM__.data.__state = null
    }
  }
}
