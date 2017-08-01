const webpack = require('webpack')

module.exports = config => {
  return new Promise((resolve, reject) => {
    const compiler = webpack(config)
    compiler.run((err, stats) => {
      if (err) return reject(err)
      resolve(stats)
    })
  })
}
