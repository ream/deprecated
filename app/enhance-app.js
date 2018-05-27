import Vue from 'vue'
// eslint-disable-next-line import/no-unresolved
import createDataStore from '#app/create-data-store'

Vue.mixin({
  beforeCreate() {
    this.$ream = this.$root
    this.$dataStore = this.$ream.$options.dataStore
  },
  computed: {
    $initialData() {
      let isRouteComponent
      for (const m of this.$route.matched) {
        for (const key of Object.keys(m.instances)) {
          const instance = m.instances[key]
          if (instance === this) {
            isRouteComponent = true
          }
        }
      }
      return isRouteComponent
        ? this.$dataStore.getData(this.$options.__file)
        : null
    }
  }
})

const Root = {
  name: 'ReamRoot',
  props: ['error'],
  render() {
    if (!this.error) {
      return <router-view />
    }
    return (
      <div>
        <h1>{this.error.code}</h1>
        <router-link to="/">Go Home!</router-link>
      </div>
    )
  }
}

export default ({ rootOptions, entry }, context) => {
  const { router, store, root = Root } = entry

  const App = {
    router,
    store,
    dataStore: createDataStore(),
    data() {
      return {
        error: null
      }
    },
    render(h) {
      return h(
        'div',
        {
          attrs: {
            id: '_ream'
          }
        },
        [
          h(root, {
            props: {
              error: this.actualError
            }
          })
        ]
      )
    },
    methods: {
      setError(error) {
        this.error = error
      }
    },
    computed: {
      actualError() {
        const error = context ? context.reamError : this.error
        if (error && error.url) {
          return error.url === this.$route.path ? error : null
        }
        return error
      }
    }
  }

  Object.assign(rootOptions, App)
}
