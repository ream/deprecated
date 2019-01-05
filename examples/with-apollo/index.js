import VueApollo from 'vue-apollo'
import createApolloClient from './createApolloClient'
import createRouter from './router'

export default context => {
  const apolloProvider = new VueApollo({
    defaultClient: createApolloClient(context) // an apollo-client instance
  })

  const router = createRouter()

  return {
    router,
    apolloProvider
  }
}
