import createRouter from '#out/router' // eslint-disable-line import/no-unresolved

export default ({ rootOptions, ssrContext }) => {
  if (rootOptions.router) return

  rootOptions.router = createRouter(ssrContext)
}
