export default ctx => {
  const { apolloProvider } = ctx.entry
  if (!apolloProvider) return

  ctx.rootOptions.provide = apolloProvider.provide()

  ctx.addMiddleware(async mContext => {
    if (process.browser) return

    await apolloProvider.prefetchAll(
      mContext,
      ctx.router.getMatchedComponents()
    )
    ctx.ssrContext.globalState.apollo = apolloProvider.getStates()
  })
}
