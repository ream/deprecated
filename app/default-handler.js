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
    const components = getMatchedComponents(to.matched)

    if (!components.length) {
      return handleError({ code: 404 })
    }

    const route = router.currentRoute

    const ps = []

    const applyData = (component, asyncData) => {
      const data = component.options.data ? component.options.data() : {}
      component.options.data = () => ({...data, ...asyncData})
      component._Ctor.options.data = component.options.data
    }

    for (const component of components) {
      if (!component.options) {
        component = Vue.extend(component)
        component._Ctor = component
      } else {
        component._Ctor = component
        component.extendOptions = component.options
      }

      if (component.options.asyncData) {
        if (isClient && window.__REAM__.data.asyncData) {
          const data = window.__REAM__.data.asyncData
          applyData(component, data)
          window.__REAM__.data.asyncData = null
        } else {
          const asyncData = component.options.asyncData({
            store,
            route,
            isServer,
            isClient
          })
          if (asyncData.then) {
            ps.push(asyncData.then(data => {
              applyData(component, data)
              isServer && deliverData({ asyncData: data })
            }))
          } else {
            applyData(component, asyncData)
          }
        }
      }

      if (component.options.preFetch) {
        const shouldFetchOnClientSide = isClient && !window.__REAM__.data.__state
        if (isServer || shouldFetchOnClientSide) {
          const preFetch = component.options.preFetch
          ps.push(preFetch({
            store,
            route,
            isServer,
            isClient
          }))
        }
      }
    }

    if (ps.length) {
      Promise.all(ps).then(() => {
        isServer && store && deliverData({ __state: store.state })
        next()
      }).catch(handleError)
    } else {
      next()
    }
  })

  if (isClient && store) {
    const state = window.__REAM__.data.__state
    if (state) {
      store.replaceState(state)
      window.__REAM__.data.__state = null
    }
  }
}
