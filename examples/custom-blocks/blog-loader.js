const parse = require('post-loader').parse

module.exports = function (source, map) {
  this.callback(null, 'module.exports = function(Component) {Component.options.blog = ' +
    JSON.stringify(parse(source.trim())) +
    '}', map)
}
