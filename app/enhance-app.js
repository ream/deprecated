import Vue from 'vue'
import createDataStore from './create-data-store'
import { setInitialData } from './utils'

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
    if (!this.$root.$options._isReamRoot) return

    this.$ream = this.$root
    this.$dataStore = this.$ream.$options.dataStore
    this.$isRouteComponent = isRouteComponent(this.$route.matched, this)

    setInitialData(this)
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
        <h1>
          {error.code}: {error.message}
        </h1>
        {__DEV__ &&
          error.code === 404 &&
          error.errorPath === '/' && (
            <p>You must create pages/*.vue or export "router" in entry file!</p>
          )}
      </div>
    )
  }
}

export default ({ rootOptions, entry }, context) => {
  const { root = Root, error = Error } = entry

  const App = {
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
        if (error && error.errorPath) {
          return error.errorPath === this.$route.path ? error : null
        }
        return error
      }
    }
  }

  Object.assign(rootOptions, App)
}
