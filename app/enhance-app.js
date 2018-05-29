import Vue from 'vue'
// eslint-disable-next-line import/no-unresolved
import createDataStore from '#app/create-data-store'

const isRouteComponent = (matched, current) => {
  let result
  for (const m of matched) {
    for (const key of Object.keys(m.instances)) {
      const instance = m.instances[key]
      if (instance === current) {
        result = true
      }
    }
  }
  return result
}

Vue.mixin({
  beforeCreate() {
    this.$ream = this.$root
    this.$dataStore = this.$ream.$options.dataStore

    const { getInitialData, __file } = this.$options
    if (getInitialData && isRouteComponent(this.$route.matched, this)) {
      const initialData = this.$dataStore.getData(__file)
      this.$initialData = initialData
    }
  },
  data() {
    return Object.assign({}, this.$initialData)
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
