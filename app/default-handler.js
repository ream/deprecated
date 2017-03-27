import Vue from 'vue'
import { getMatchedComponents, applyAsyncData } from './utils'

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

      for (const [index, Component] of Components.entries()) {
        if (Component.options.asyncData) {
          if (isClient && window.__REAM__.data[`asyncData${index}`]) {
            const data = window.__REAM__.data[`asyncData${index}`]
            applyAsyncData(Component, data)
            window.__REAM__.data[`asyncData${index}`] = null
          } else {
            const asyncData = Component.options.asyncData({
              store,
              route: to,
              isServer,
              isClient
            })
            if (asyncData.then) {
              ps.push(asyncData.then(data => {
                applyAsyncData(Component, data)
                isServer && deliverData({ [`asyncData${index}`]: data })
              }))
            } else {
              applyAsyncData(Component, asyncData)
            }
          }
        }

        if (Component.options.preFetch) {
          const shouldFetchOnClientSide = isClient && !window.__REAM__.data.__state
          if (isServer || shouldFetchOnClientSide) {
            const preFetch = Component.options.preFetch
            ps.push(preFetch({
              store,
              route: to,
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
