const joi = require('joi')

const schema = joi.object().keys({
  entry: joi.string(),
  outDir: joi.string(),
  fsRoutes: joi.alternatives().try([
    joi.object().keys({
      baseDir: joi.string(),
      basePath: joi.string(),
      match: joi.object().type(RegExp)
    }),
    joi.boolean()
  ]),
  transpileDependencies: joi.array().items(joi.string()),
  runtimeCompiler: joi.boolean(),
  productionSourceMap: joi.boolean(),
  chainWebpack: joi.func(),
  configureWebpack: joi.alternatives().try(joi.object(), joi.func()),
  server: joi.object().keys({
    port: joi.number(),
    host: joi.string()
  }),
  plugins: joi.array().items(
    joi.object().keys({
      name: joi.string().required(),
      apply: joi.func().required()
    })
  ),
  generate: joi.object().keys({
    routes: joi.array().items(joi.string())
  }),
  css: joi.object().keys({
    extract: joi.boolean()
  }),
  // In the future this option could also be an object
  // To add more controls, e.g. "notifyOnUpdate" will show a notifier when a new update is available
  pwa: joi.boolean(),
  minimize: joi.boolean(),
  defaultBabelPreset: joi.any().valid(['minimal', false]),
  htmlMinifier: joi.alternatives().try(joi.object(), joi.boolean())
})

module.exports = config => {
  return schema.validate(config, {
    convert: false
  })
}
