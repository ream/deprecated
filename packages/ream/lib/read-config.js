const fs = require('fs')
const path = require('path')

module.exports = () => {
  const filepath = path.resolve('ream.config.js')
  if (!fs.existsSync(filepath)) {
    return {}
  }
  return require(filepath)
}
