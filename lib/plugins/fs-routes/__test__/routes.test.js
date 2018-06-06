const path = require('path')
const fs = require('fs-extra')
const { collectRoutes } = require('../routes-template')

function testCollectRoutes(dir, opts) {
  test(`Collect routes in ${dir}`, async () => {
    const fullDir = path.resolve(__dirname, dir)
    const routes = await collectRoutes({
      dir: fullDir,
      componentPrefix: '#base',
      basePath: '/',
      options: {
        match: /\.vue$/
      },
      ...opts
    })
    const expectedRoutesFile = path.join(fullDir, '_expected_routes.json')
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
