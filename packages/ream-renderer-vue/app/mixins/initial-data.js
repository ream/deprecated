import Vue from 'vue'

export default {
  beforeCreate() {
    const { name, getInitialData } = this.$options
    if (name === 'ream-root' || !getInitialData) return

    if (process.env.NODE_ENV !== 'production' && !name) {
      Object.defineProperty(this, '$initialData', {
        get() {
          console.error(`[REAM] Expect route component to have a unique name in order to use $initialData!`)
        }
      })
      return
    }

    const namespace = `${this.$route.path}::${name}`
    const initialDataStore = process.isServer ? this.$ssrContext.initialData : window.__REAM__.initialData
    const initialData = initialDataStore && initialDataStore[namespace]
    if (initialData) {
      Vue.util.defineReactive(this, '$initialData', initialData)
    }
  }
}
