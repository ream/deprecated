#!/usr/bin/env node
const importLocalFile = require('import-local-file')

const localFile = importLocalFile()

if (localFile) {
  console.log('> Using local installed version of Ream')
  require(localFile)
} else {
  require('./run') // eslint-disable-line import/no-unassigned-import
}
