export const routerReady = router =>
  new Promise((resolve, reject) => {
    router.onReady(resolve, reject)
  })

export const getRequireDefault = obj => {
  // eslint-disable-next-line no-prototype-builtins
  return obj && obj.hasOwnProperty('default') ? obj.default : obj
}
