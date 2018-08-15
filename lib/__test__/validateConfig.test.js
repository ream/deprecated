const validateConfig = require('../validateConfig')

describe('options', () => {
  it('validate', () => {
    const res = validateConfig(true, {
      entry: 'hi',
      server: {
        port: 7000
      }
    })
    if (res.error) {
      throw res.error
    }
    expect(res.value).toMatchSnapshot()
  })
})
