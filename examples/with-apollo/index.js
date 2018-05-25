import VueApollo from 'vue-apollo'
import createApolloClient from './createApolloClient'
import createRouter from './router'

const document = ({ headTags, scripts, data }) => {
  const { apolloState } = data
  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui" />
      ${headTags()}
    </head>
    <body>
      <!--ream-root-placeholder-->
      <script>${apolloState}</script>
      ${scripts()}
    </body>
  </html>
  `
}

export default () => {
  const apolloProvider = new VueApollo({
    defaultClient: createApolloClient() // an apollo-client instance
  })

  const router = createRouter()

  return {
    document,
    extendRootOptions(rootOptions) {
      rootOptions.provide = apolloProvider.provide()
    },
    router,
    async getDocumentData() {
      await apolloProvider.prefetchAll({
        route: router.currentRoute,
      }, router.getMatchedComponents())
      const apolloState = apolloProvider.exportStates()
      return {
        apolloState
      }
    }
  }
}
