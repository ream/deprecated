const path = require('path')

exports.ownDir = (...args) => {
  return path.join(__dirname, '../', ...args)
}

exports.cwd = (...args) => {
  return path.resolve(...args)
}

exports.promisify = handler => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      handler.call(handler, ...args, (err, result) => {
        if (err) return reject(err)
        resolve(result)
      })
    })
  }
}
