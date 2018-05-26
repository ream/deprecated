const path = require('path')

module.exports = p => path.relative(process.cwd(), p)
