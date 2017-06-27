const noop = () => {}

export let warn = noop

if (process.env.NODE_ENV !== 'production') {
  warn = (condition, msg) => {
    if (!condition) {
      console.error('[ream]', msg)
    }
  }
}

export function applyPreFetchData(context, data, namespace = 'default') {
  if (data == null) return

  context.data.preFetch = context.data.preFetch || {}
  context.data.preFetch[namespace] = {
    ...(context.data.preFetch[namespace] || {}),
    ...data
  }
}
