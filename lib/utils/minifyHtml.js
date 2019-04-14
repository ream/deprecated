const { minify } = require('html-minifier')

const defaultOptions = {
  collapseWhitespace: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true
}

module.exports = (html, options) =>
  options ? minify(html, options === true ? defaultOptions : options) : html
