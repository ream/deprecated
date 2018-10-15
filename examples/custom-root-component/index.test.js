const testProject = require('../../test/lib/testProject')

testProject(__dirname, async (t, c) => {
  t.matchSnapshot((await c.axios.get('/')).data, 'page')
})
