// this might be useful for eslint-plugin-import
const app = require('.')()

module.exports = app.createConfigs()[0]

/* example .eslintrc
{
  "settings": {
    "import/resolver": {
      "webpack": {
        "config": "./node_modules/ream/webpack.config.js"
      }
    }
  }
}
*/
