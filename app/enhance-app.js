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
  render(h) {
    return h('router-view')
  }
}

const Error = {
  name: 'ReamError',
  functional: true,
  props: ['error'],
  render(
    h,
    {
      props: { error }
    }
  ) {
    return (
      <div>
        <h1>{error.code}</h1>
        <router-link to="/">Go Home!</router-link>
      </div>
    )
  }
}

export default ({ rootOptions, entry }, context) => {
  const { router, root = Root, error = Error } = entry

  const App = {
    router,
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
          this.actualError
            ? h(error, {
                props: {
                  error: this.actualError
                }
              })
            : h(root)
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
