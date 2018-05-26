const babelLoader = require('babel-loader')
const logger = require('../../logger')

module.exports = babelLoader.custom(babel => {
  const configs = new Set()
  let reamPresetItem

  return {
    customOptions(opts) {
      const custom = opts.reamPresetOptions
      delete opts.reamPresetOptions

      return { loader: opts, custom }
    },
    config(cfg, { customOptions }) {
      const options = Object.assign({}, cfg.options)

      if (cfg.hasFilesystemConfig()) {
        for (const file of [cfg.babelrc, cfg.config]) {
          if (file && !configs.has(file)) {
            configs.add(file)
            logger.debug(`Using external babel config file: ${file}`)
          }
        }
      }

      reamPresetItem =
        reamPresetItem ||
        babel.createConfigItem(
          [require.resolve('../../babel/preset'), customOptions],
          {
            type: 'preset'
          }
        )

      // Add our default preset
      options.presets = [reamPresetItem, ...options.presets]

      return options
    }
  }
})
