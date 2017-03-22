let asyncData = null

export default function (Vue) {
  Vue.mixin({
    created() {
      if (this.$options.asyncData) {
        const applyData = data => {
          for (const key in data) {
            this[key] = data[key]
          }
        }

        if (process.env.BROWSER_BUILD) {
          if (window.__UNVUE__.asyncData) {
            this.$asyncData = window.__UNVUE__.asyncData
            window.__UNVUE__.asyncData = null
            applyData(this.$asyncData)
          } else {
            const data = this.$options.asyncData({ store: this.$store })
            if (data.then) {
              data.then(_data => {
                this.$asyncData = _data
                applyData(this.$asyncData)
              })
            } else {
              this.$asyncData = data
              applyData(this.$asyncData)
            }
          }
        } else {
          this.$asyncData = asyncData
          asyncData = null
          applyData(this.$asyncData)
        }
      }
    }
  })
}

export const setAsyncData = data => {
  asyncData = data
}
