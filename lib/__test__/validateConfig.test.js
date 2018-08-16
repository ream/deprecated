const validateConfig = require('../validateConfig')

describe('options', () => {
  it('validate', () => {
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
})
