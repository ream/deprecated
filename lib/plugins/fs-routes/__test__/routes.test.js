const path = require('path')
const fs = require('fs-extra')
const { collectRoutes } = require('../routes-template')

function testCollectRoutes(dir, options) {
  test(`Collect routes in ${dir}`, async () => {
    const pagesDir = path.resolve(__dirname, dir)
    const routes = await collectRoutes(
      {
        pagesDir,
        componentPrefix: '#base',
        basePath: '/',
        ...options
      },
      {
        match: /\.vue$/,
        ...(options && options.options)
      }
    )
    const expectedRoutesFile = path.join(pagesDir, '_expected_routes.json')
    if (process.env.WRITE_EXPECTED_ROUTES) {
      await fs.writeFile(
        expectedRoutesFile,
        JSON.stringify(routes, null, 2) + '\n'
      )
    } else {
      expect(routes).toEqual(await fs.readJson(expectedRoutesFile))
    }
  })
}

for (const preset of fs.readdirSync(path.resolve(__dirname, 'presets'))) {
  testCollectRoutes(path.join('presets', preset))
}

testCollectRoutes('special/typescript', {
  options: {
    match: /\.(vue|ts)$/
  }
})

testCollectRoutes('special/custom-base-path', {
  basePath: '/some'
})

test('Return empty routes for non-existent directory', async () => {
  expect(
    await collectRoutes({
      dir: path.resolve(__dirname, 'no-such-path')
    })
  ).toEqual([])
})
