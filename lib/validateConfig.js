const joi = require('joi')

const createSchema = dev => {
  const defaults = {
    entry: 'index.js',
    fsRoutes: {
      baseDir: 'pages',
      basePath: '/',
      match: /\.(vue|js)$/i
    },
    transpileDependencies: [],
    runtimeCompiler: false,
    productionSourceMap: true,
    server: {
      port: process.env.PORT || 4000,
      host: process.env.HOST || '0.0.0.0'
    },
    plugins: [],
    generate: {
      routes: ['/']
    },
    css: {
      extract: !dev
    },
    pwa: false,
    minimize: !dev
  }

  const schema = joi.object().keys({
    entry: joi.string().default(defaults.entry),
    fsRoutes: joi
      .alternatives()
      .try([
        joi.object().keys({
          baseDir: joi.string().default(defaults.fsRoutes.baseDir),
          basePath: joi.string().default(defaults.fsRoutes.basePath),
          match: joi
            .object()
            .type(RegExp)
            .default(defaults.fsRoutes.match)
        }),
        false
      ])
      .default(defaults.fsRoutes),
    transpileDependencies: joi
      .array()
      .items(joi.string())
      .default(defaults.transpileDependencies),
    runtimeCompiler: joi.boolean().default(defaults.runtimeCompiler),
    productionSourceMap: joi.boolean().default(defaults.productionSourceMap),
    chainWebpack: joi.func(),
    configureWebpack: joi.alternatives().try(joi.object(), joi.func()),
    server: joi
      .object()
      .keys({
        port: joi.number().default(defaults.server.port),
        host: joi.string().default(defaults.server.host)
      })
      .default(defaults.server),
    plugins: joi
      .array()
      .items(
        joi.object().keys({
          name: joi.string().required(),
          apply: joi.func().required()
        })
      )
      .default(defaults.plugins),
    generate: joi
      .object()
      .keys({
        routes: joi
          .array()
          .items(joi.string())
          .default(defaults.generate.routes)
      })
      .default(defaults.generate),
    css: joi
      .object()
      .keys({
        extract: joi.boolean().default(defaults.css.extract)
      })
      .default(defaults.css),
    // In the future this option could also be an object
    // To add more controls, e.g. "notifyOnUpdate" will show a notifier when a new update is available
    pwa: joi.boolean().default(defaults.pwa),
    minimize: joi.boolean().default(defaults.minimize),
    defaultBabelPreset: joi.any().valid(['minimal', false])
  })

  return schema
}

module.exports = (dev, config) => {
  return createSchema(dev).validate(config, {
    convert: false
  })
}
