const path = require('path')

module.exports = {
  name: 'builtin:vuex',
  apply(api) {
    api.enhanceAppFiles.add(path.join(__dirname, 'inject.js'))
  }
}
