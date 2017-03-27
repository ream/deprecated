export function getMatchedComponents(routes) {
  let res = []
  for (const route of routes) {
    for (const key in route.components) {
      res.push(route.components[key])
    }
  }
  return res
}

export function applyAsyncData(component, asyncData) {
  const data = component.options.data ? component.options.data() : {}
  component.options.data = () => ({...data, ...asyncData})
  component._Ctor.options.data = component.options.data
}
