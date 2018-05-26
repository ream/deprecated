const path = require('path')

exports.ownDir = (...args) => {
  return path.join(__dirname, '../../', ...args)
}

exports.inWorkspace = __dirname.indexOf('/packages/ream/lib/') > 0
