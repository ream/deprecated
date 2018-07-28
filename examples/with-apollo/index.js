import VueApollo from 'vue-apollo'
import createApolloClient from './createApolloClient'
import createRouter from './router'

export default () => {
  const apolloProvider = new VueApollo({
    defaultClient: createApolloClient() // an apollo-client instance
  })

  const router = createRouter()

  return {
    router,
    apolloProvider
  }
}
