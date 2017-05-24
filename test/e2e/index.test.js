import fs from 'fs'
import { join } from 'path'
import ream from '../../'

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000

describe('build', () => {
  test('emit files', async () => {
    const app = ream({
      cwd: __dirname,
      entry: 'fixture/index.js'
    })
    await app.build()
      .then(() => {
        expect(fs.readdirSync(join(__dirname, '.ream/dist')).length)
          .toBe(9)
      })
  })
})
