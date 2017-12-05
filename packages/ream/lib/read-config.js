const fs = require('fs')
const path = require('path')

module.exports = config => {
  const filepath = path.resolve(config || 'ream.config.js')
  if (!fs.existsSync(filepath)) {
    return {}
  }
  return require(filepath)
}
