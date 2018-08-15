/* globals window */
export default ({
  ssrContext,
  entry,
  rootOptions,
  event,
  getInitialDataContext,
  addMiddleware
}) => {
  const { store } = entry

  if (!store) return

  rootOptions.store = store

  getInitialDataContext(context => {
    context.store = store
  })

  addMiddleware(context => {
    if (process.server && context.store._actions.reamServerInit) {
      return context.store.dispatch('reamServerInit', context)
    }
  })

  event.$on('before-server-render', () => {
    ssrContext.globalState.state = store.state
  })

  event.$on('before-client-render', () => {
    store.replaceState(window.__REAM__.state)
  })
}
