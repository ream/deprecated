const express = require('express')

module.exports = (path, cache) =>
  express.static(path, {
    maxAge: cache ? '1d' : 0,
    dotfiles: 'allow'
  })
