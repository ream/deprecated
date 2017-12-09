const noop = () => {}

export let warn = noop

if (process.env.NODE_ENV !== 'production') {
  warn = (condition, msg) => {
    if (!condition) {
      console.error('[REAM]', msg)
    }
  }
}

export function handleInitialData({
  getInitialData,
  scopeContext,
  context,
  name
}) {
  if (!getInitialData || !name) return

  const res = getInitialData(scopeContext)

  if (!res.then) return res

  return res.then(data => {
    if (typeof data !== 'object') return

    const namespace = `${scopeContext.route.path}::${name}`

    context.initialData = context.initialData || {}
    context.initialData[namespace] = {
      ...(context.initialData[namespace] || {}),
      ...data
    }
  })
}
