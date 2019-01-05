import Vue from 'vue'
import Meta from 'vue-meta'
import Router from 'vue-router'
// eslint-disable-next-line import/no-unresolved
import _entry from '#out/entry'
// eslint-disable-next-line import/no-unresolved
import enhanceApp from '#out/enhance-app'
import createDataStore from './create-data-store'
import { setInitialData } from './utils'

Vue.config.productionTip = false

Vue.use(Router)

Vue.use(Meta, {
  keyName: 'head',
  attribute: 'data-ream-head',
  ssrAttribute: 'data-ream-ssr',
  tagIDKeyName: 'rhid'
})

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

function createRootComponent(entry, context) {
  const { root = Root, error = Error } = entry

  return {
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
}

export default context => {
  if (__DEV__ && typeof _entry !== 'function') {
    throw new TypeError(
      `The entry file should export a function but got "${typeof _entry}"`
    )
  }

  const entry = _entry(context)
  if (__DEV__ && typeof entry !== 'object') {
    throw new TypeError(
      `The return value of the default export in entry file should be a plain object but got "${typeof entry}"`
    )
  }

  if (context) {
    context.entry = entry
  }

  const rootOptions = {
    ...createRootComponent(entry, context),
    _isReamRoot: true,
    router: entry.router || new Router({ mode: 'history' })
  }
  const getInitialDataContextFns = [entry.getInitialDataContext].filter(Boolean)
  const middlewares = [entry.middleware].filter(Boolean)

  const event = new Vue()
  const enhanceContext = {
    rootOptions,
    entry,
    ssrContext: context,
    event,
    getInitialDataContext(fn) {
      getInitialDataContextFns.push(fn)
    },
    addMiddleware(fn) {
      middlewares.push(fn)
    }
  }

  enhanceApp(enhanceContext, context)

  if (entry.extendRootOptions) {
    entry.extendRootOptions(rootOptions)
  }

  const app = new Vue(rootOptions)

  return {
    app,
    router: rootOptions.router,
    entry,
    getInitialDataContextFns,
    event,
    dataStore: rootOptions.dataStore,
    middlewares
  }
}
