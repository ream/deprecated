const testProject = require('../../lib/testProject')

testProject(__dirname, async (t, c) => {
  await t.test('server-side 404', async t => {
    const res = await c.axios.get('/not-found', {
      validateStatus: status => status === 404
    })
    t.matchSnapshot(res.data)
  })

  await t.test('client-side 404', async t => {
    const page = await c.loadPage('/')
    await page.waitForXPath('//a[text()="Not Found"]').then(el => el.click())
    await page
      .waitForSelector('#_ream')
      .then(el => page.evaluate(el => el.innerText, el))
      .then(text => t.equal(text, '404: page not found'))
  })

  await t.test('server-side unhandled error', async t => {
    const res = await c.axios.get('/error', {
      validateStatus: status => status === 500
    })
    t.equal(res.data, 'server error')
  })

  // Don't test unhandled client-side error for now, as it's (ha-ha) not handled.
})
