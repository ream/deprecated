const testProject = require('../../lib/testProject')

testProject(__dirname, async (t, c) => {
  await t.test('entry middleware', async t => {
    const page = await c.loadPage('/')
    await page.waitForXPath('//strong[text()="server"]')
    await page.waitForSelector('a').then(e => e.click())
    await page.waitForXPath('//strong[text()="client"]')
    t.pass()
  })
})
