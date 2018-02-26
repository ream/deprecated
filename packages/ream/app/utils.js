export const routerReady = router =>
  new Promise((resolve, reject) => {
    router.onReady(resolve, reject)
  })

export const interopDefault = ex =>
  typeof ex === 'object' && 'default' in ex ? ex.default : ex
