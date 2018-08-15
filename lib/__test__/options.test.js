const validateOptions = require('../options')

describe('options', () => {
  it('validate', () => {
    const res = validateOptions({
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
