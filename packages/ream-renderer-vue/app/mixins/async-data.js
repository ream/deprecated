export default {
  beforeCreate() {
    const { name, asyncData } = this.$options
    if (name === 'ream-root' || !asyncData) return

    if (process.env.NODE_ENV !== 'production' && !name) {
      Object.defineProperty(this, '$asyncData', {
        get() {
          console.error(`[REAM] Expect route component to have a unique name in order to use $asyncData!`)
        }
      })
      return
    }

    const namespace = `${this.$route.path}::${name}`
    const asyncDataStore = process.isServer ? this.$ssrContext.data.asyncData : window.__REAM__.data.asyncData
    this.$asyncData = asyncDataStore && asyncDataStore[namespace]
  }
}
