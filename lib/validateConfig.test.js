const tap = require('tap')
const validateConfig = require('./validateConfig')

tap.doesNotThrow(() => {
  const res = validateConfig({
    entry: 'hi',
    server: {
      port: 7000
    }
  })
  if (res.error) {
    throw res.error
  }
})
