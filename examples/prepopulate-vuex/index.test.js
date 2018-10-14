const testProject = require('../../test/lib/testProject')

testProject(__dirname, async (t, axios) => {
  t.matchSnapshot((await axios.get('/')).data, 'page')
})
