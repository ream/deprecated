const serverConfig = require('../webpack/webpack.config.server')
const clientConfig = require('../webpack/webpack.config.client')

module.exports = api => {
  api.extendWebpack((config, { isServer }) => {
    if (isServer) {
      serverConfig(api, config)
    } else {
      clientConfig(api, config)
    }
  })
}
