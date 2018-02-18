const serveStatic = require('serve-static')

module.exports = (path, cache) =>
  serveStatic(path, {
    maxAge: cache ? '1d' : 0,
    dotfiles: 'allow'
  })
