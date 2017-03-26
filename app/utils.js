export function getMatchedComponents(routes) {
  let res = []
  for (const route of routes) {
    for (const key in route.components) {
      res.push(route.components[key])
    }
  }
  return res
}
