const babel = require('@babel/core')

describe('addInitialDataKey', () => {
  it('works', () => {
    const { code } = babel.transform(
      `
    const a = {
      getInitialData() {}
    }
    const b = {
      getInitialData: () => {}
    }
    `,
      {
        babelrc: false,
        plugins: [require.resolve('../addInitialDataKey')],
        filename: 'foo'
      }
    )
    expect(code.match(/initialDataKey:/g)).toHaveLength(2)
  })
})
