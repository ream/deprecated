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
