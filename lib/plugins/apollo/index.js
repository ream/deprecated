const path = require('path')

module.exports = {
  name: 'builtin:apollo',
  apply(api) {
    api.enhanceAppFiles.add(path.join(__dirname, 'apollo-inject.js'))
  }
}
