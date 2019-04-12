const testProject = require('../../lib/testProject')

const configs = [
  {
    htmlMinifier: false
  },
  {
    htmlMinifier: true
  },
  {
    htmlMinifier: {
      minifyCSS: true
    }
  }
]

for (const config of configs) {
  testProject(
    __dirname,
    async (t, c) => {
      t.matchSnapshot((await c.axios.get('/')).data, 'page')
    },
    config
  )
}
