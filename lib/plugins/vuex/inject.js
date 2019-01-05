/* globals window */
export default ({ ssrContext, entry, rootOptions, event, addMiddleware }) => {
  const { store } = entry

  if (!store) return

  rootOptions.store = store

  addMiddleware(context => {
    context.store = store
    if (process.server && store._actions.reamServerInit) {
      return store.dispatch('reamServerInit', context)
    }
  })

  event.$on('before-server-render', () => {
    ssrContext.globalState.state = store.state
  })

  event.$on('before-client-render', () => {
    store.replaceState(window.__REAM__.state)
  })
}
