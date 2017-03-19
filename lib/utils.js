const path = require('path')

exports.ownDir = (...args) => {
  return path.join(__dirname, '../', ...args)
}

exports.cwd = (...args) => {
  return path.resolve(...args)
}
