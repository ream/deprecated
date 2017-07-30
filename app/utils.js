const noop = () => {}

export let warn = noop

if (process.env.NODE_ENV !== 'production') {
  warn = (condition, msg) => {
    if (!condition) {
      console.error('[REAM]', msg)
    }
  }
}

export function handleAsyncData({
  asyncData,
  scopeContext,
  context,
  name
}) {
  if (!asyncData || !name) return

  const res = asyncData(scopeContext)

  if (!res.then) return res

  return res.then(data => {
    if (typeof data !== 'object') return

    const namespace = `${scopeContext.route.path}::${name}`

    context.data.asyncData = context.data.asyncData || {}
    context.data.asyncData[namespace] = {
      ...(context.data.asyncData[namespace] || {}),
      ...data
    }
  })
}
