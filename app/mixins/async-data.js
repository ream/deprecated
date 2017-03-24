export default function (Vue) {
  Vue.mixin({
    created() {
      if (this.$options.asyncData) {
        const applyData = data => {
          for (const key in data) {
            this[key] = data[key]
          }
        }

        const fetchData = () => {
          const data = this.$options.asyncData.call(this, { store: this.$store, route: this.$route })
          if (data.then) {
            data.then(_data => {
              applyData(_data)
            })
          }
        }

        if (process.env.BROWSER_BUILD) {
          // Only apply cache from global variable on the first render
          // i.e. it won't apply twice after nagivated in client-side router
          if (window.__UNVUE__.asyncData) {
            const data = window.__UNVUE__.asyncData
            applyData(data)
            window.__UNVUE__.asyncData = undefined
          } else {
            fetchData()
          }
        } else {
          const cache = process.__CACHE__
          applyData(cache.get(`asyncData:${this.$route.fullPath}`))
        }
      }
    }
  })
}
