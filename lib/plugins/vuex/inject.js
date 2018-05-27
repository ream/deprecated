/* globals window */
export default ({
  ssrContext,
  entry,
  rootOptions,
  event,
  getInitialDataContext
}) => {
  const { store } = entry

  if (!store) return

  rootOptions.store = store

  getInitialDataContext(context => {
    context.store = store
  })

  event.$on('before-server-render', () => {
    ssrContext.globalState.state = store.state
  })

  event.$on('before-client-render', () => {
    store.replaceState(window.__REAM__.state)
  })
}
