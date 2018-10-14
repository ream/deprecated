const testProject = require('../../test/lib/testProject')

testProject(__dirname, async (t, axios) => {
  for (const url of ['/', '/user', '/user/mary']) {
    t.matchSnapshot((await axios.get(url)).data, url)
  }
  for (const url of ['/bummer', '/user/bummer']) {
    t.rejects(axios.get(url))
  }
})
