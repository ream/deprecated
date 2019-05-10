const testProject = require('../../lib/testProject')

const configs = [
  {
    minifyHtml: false
  },
  {
    minifyHtml: true
  },
  {
    minifyHtml: {
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
