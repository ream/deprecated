const path = require('path')
const tap = require('tap')
const fs = require('fs-extra')
const { collectRoutes } = require('../routes-template')

function testCollectRoutes(dir, options) {
  return tap.test(dir, async t => {
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
    t.matchSnapshot(routes, 'routes')
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

tap.test('Return empty routes for non-existent directory', async () => {
  tap.same(
    await collectRoutes({
      dir: path.resolve(__dirname, 'no-such-path')
    }),
    []
  )
})
