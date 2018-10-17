const testProject = require('../../lib/testProject')

testProject(__dirname, async (t, c) => {
  await t.test('server-side redirect', async t => {
    const res = await c.axios.get('/2', {
      maxRedirects: 0,
      validateStatus: status => status >= 300 && status < 400
    })
    t.equal(res.headers.location, '/3')
  })

  await t.test('client-side redirect', async t => {
    const page = await c.loadPage('/1')
    await page.waitForXPath('//a[text()="Page 2"]').then(e => e.click())
    await page
      .waitForSelector('#target')
      .then(el => page.evaluate(el => el.innerText, el))
      .then(text => t.equal(text, 'Page 3'))
  })
})
