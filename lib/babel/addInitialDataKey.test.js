const tap = require('tap')
const babel = require('@babel/core')

const plugin = require.resolve('./addInitialDataKey')

tap.test(async t => {
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
      plugins: [plugin],
      filename: 'foo'
    }
  )
  t.equal(code.match(/initialDataKey:/g).length, 2)
})

tap.test('ignore object decomposition', async t => {
  const { code } = babel.transform(
    `
  const { getInitialData } = Component
  `,
    {
      babelrc: false,
      plugins: [plugin],
      filename: 'foo'
    }
  )
  t.equal(code.match(/initialDataKey:/g), null)
})
