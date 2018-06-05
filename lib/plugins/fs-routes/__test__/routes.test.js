const path = require('path')
const fs = require('fs-extra')
const { collectRoutes } = require('../routes-template')

async function testCollectRoutes(dir, opts) {
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
  const expectedRoutesFile = path.join(fullDir, 'routes.json')
  if (process.env.WRITE_EXPECTED_ROUTES) {
    await fs.writeFile(expectedRoutesFile, JSON.stringify(routes, null, 2))
  } else {
    expect(routes).toEqual(await fs.readJson(expectedRoutesFile))
  }
}

describe('Presets', () => {
  for (const preset of fs.readdirSync(path.resolve(__dirname, 'presets'))) {
    test(preset, () => testCollectRoutes(path.join('presets', preset)))
  }
})

test('Typescript', () =>
  testCollectRoutes('special/typescript', {
    options: {
      match: /\.(vue|ts)$/
    }
  }))

test('Custom base path', () =>
  testCollectRoutes('special/custom-base-path', {
    basePath: '/some'
  }))
