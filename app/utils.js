const noop = () => {}

export let warn = noop

if (process.env.NODE_ENV !== 'production') {
  warn = (condition, msg) => {
    if (!condition) {
      console.error('[ream]', msg)
    }
  }
}
