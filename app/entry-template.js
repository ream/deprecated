const fs = require('fs-extra')

// Poor man hot reload template for the app entry.
// Ideally, this fallback should be handled by webpack.
// However, at the moment there is no way to disable warning emitted by
// require.resolve('#app-entry') when the entry module does not exist.
//
// See discussion in https://github.com/ream/ream/pull/96

module.exports = api => {
  if (
    !(
      api.options.entry &&
      fs.pathExistsSync(api.resolveBaseDir(api.options.entry))
    )
  ) {
    return ``
  }

  return `
  import entry from '#app-entry'
  export default entry
  `
}
