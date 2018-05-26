const path = require('path')
const JoyCon = require('joycon').default

module.exports = new JoyCon({
  stopDir: path.dirname(process.cwd())
})
