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

// it('ignores object decomposition', () => {
//   const { code } = babel.transform(
//     `
//   const { getInitialData } = Component
//   `,
//     {
//       babelrc: false,
//       plugins: [require.resolve('../addInitialDataKey')],
//       filename: 'foo'
//     }
//   )
//   expect(code.match(/initialDataKey:/g)).toBeNull()
// })
