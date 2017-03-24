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

        const name = this.$options.name
        const key = `asyncData:${name}:${this.$route.fullPath}`

        if (process.env.BROWSER_BUILD) {
          // Only apply cache from global variable on the first render
          // i.e. it won't apply twice after nagivated in client-side router
          if (window.__UNVUE__[key]) {
            const data = window.__UNVUE__[key]
            applyData(data)
            window.__UNVUE__.asyncData = null
          } else {
            fetchData()
          }
        } else {
          const cache = process.__CACHE__
          applyData(cache.get(key))
        }
      }
    }
  })
}
