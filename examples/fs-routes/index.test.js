const testProject = require('../../test/lib/testProject')

testProject(__dirname, async (t, c) => {
  for (const url of ['/', '/user', '/user/mary']) {
    t.matchSnapshot((await c.axios.get(url)).data, url)
  }
  for (const url of ['/bummer', '/user/mary/bummer']) {
    await t.rejects(c.axios.get(url))
  }
})
