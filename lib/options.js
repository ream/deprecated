const joi = require('joi')

const createSchema = ({ dev }) => {
  dev = dev === undefined ? process.env.NODE_ENV !== 'production' : dev

  const defaults = {
    dev,
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
    }
  }

  const schema = joi.object().keys({
    dev: joi.boolean().default(defaults.dev),
    entry: joi.string().default(defaults.entry),
    fsRoutes: joi
      .object()
      .keys({
        baseDir: joi.string().default(defaults.fsRoutes.baseDir),
        basePath: joi.string().default(defaults.fsRoutes.basePath),
        match: joi
          .object()
          .type(RegExp)
          .default(defaults.fsRoutes.match)
      })
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
      .default(defaults.css)
  })

  return schema
}

module.exports = options => {
  return createSchema({ dev: options.dev }).validate(options, {
    convert: false
  })
}
