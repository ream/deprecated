export default {
  beforeCreate() {
    if (this.$options.name === 'ream-root') return

    this.$reamError = typeof window === 'undefined' ? this.$ssrContext.error : window.__REAM__.error
  }
}
