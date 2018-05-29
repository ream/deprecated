export const routerReady = router =>
  new Promise((resolve, reject) => {
    router.onReady(resolve, reject)
  })

export const getRequireDefault = obj => {
  // eslint-disable-next-line no-prototype-builtins
  return obj && obj.hasOwnProperty('default') ? obj.default : obj
}

export const setInitialData = vm => {
  const { getInitialData, name, initialDataKey } = vm.$options

  if (getInitialData) {
    vm.$initialDataKey = vm.$initialDataKey || initialDataKey || name

    if (!vm.$initialDataKey) {
      throw new Error(
        'Route component requires a unique component `name` to use `getInitialData` method'
      )
    }

    if (!vm.$isRouteComponent) {
      throw new Error(
        '`getInitialData` method can only be used in a route component'
      )
    }

    const initialData = vm.$dataStore.getData(vm.$initialDataKey)
    vm.$initialData = initialData
  }
}
