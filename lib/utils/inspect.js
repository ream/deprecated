const util = require('util')

module.exports = obj =>
  util.inspect(obj, {
    depth: null,
    colors: true
  })
