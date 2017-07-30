const noop = () => {}

export let warn = noop

if (process.env.NODE_ENV !== 'production') {
  warn = (condition, msg) => {
    if (!condition) {
      console.error('[ream]', msg)
    }
  }
}

export function applyFetchData(context, data, route, componentOptions) {
  if (data == null) return

  if (!componentOptions.name) throw new Error('Expected route component to have a unique name!')

  const namespace = createNamespace(route, componentOptions)

  context.data.fetchedStore = context.data.fetchedStore || {}
  context.data.fetchedStore[namespace] = {
    ...(context.data.fetchedStore[namespace] || {}),
    ...data
  }
}

export function createNamespace(route, componentOptions) {
  return `${route.path}::${componentOptions.name}`
}
