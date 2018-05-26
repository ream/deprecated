export const routerReady = router =>
  new Promise((resolve, reject) => {
    router.onReady(resolve, reject)
  })
