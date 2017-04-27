import Vue from 'vue'
import createApp from './create-app'

let hasGlobalMixin

export default ssrContext => {
  const dev = ssrContext.dev
  const s = dev && Date.now()

  if (!hasGlobalMixin) {
    hasGlobalMixin = true
    Vue.mixin({
      created() {
        for (const key in ssrContext.data) {
          console.log
          this[key] = ssrContext.data[key]
        }
      }
    })
  }

  return new Promise((resolve, reject) => {
    const { app, router, store } = createApp(ssrContext)

    router.push(ssrContext.url)

    router.onReady(() => {
      const route = router.currentRoute
      const matchedComponents = router.getMatchedComponents()
      Promise.all(matchedComponents.map((Component, index) => {
        // delete Component._Ctor
        const ps = []
        const ctx = { route, store }
        if (Component.preFetch) {
          ps.push(Component.preFetch(ctx))
        }
        // if (Component.asyncData) {
        //   ps.push(Component.asyncData(ctx).then(data => {
        //     ssrContext.data.asyncData = ssrContext.data.asyncData || []
        //     ssrContext.data.asyncData[index] = data
        //     const dataFn = Component.data
        //     Component.data = function () {
        //       const defaultData = dataFn ? dataFn.call(this) : {}
        //       return {...defaultData, ...data}
        //     }
        //     console.log(Component)
        //   }))
        // }
        return Promise.all(ps)
      })).then(() => {
        ssrContext.state = store.state
        ssrContext.meta = app.$meta && app.$meta()
        resolve(app)
      }).catch(reject)
    })
  })
}
