function handleRoute (route) {
  if (route.endsWith('.html')) {
    return route
  }

  return route.replace(/\/?$/, '/index.html')
}

function isType(obj, type) {
  return Object.prototype.toString.call(obj) === `[object ${type}]`
}

function parseRoutes(routes) {
  if (isType(routes, 'Object')) {
    return Object.keys(routes).map(route => {
      if (routes[route] === true) return [route]

      const patterns = Array.isArray(routes[route]) ? routes[route] : [routes[route]]

      return patterns.map(pattern => {
        const toPath = pathToRegexp.compile(route)
        return toPath(pattern)
      })
    }).reduce((curr, next) => {
      return curr.concat(next)
    }, [])
  }

  return routes
}

module.exports = {
  isType,
  handleRoute,
  parseRoutes
}
