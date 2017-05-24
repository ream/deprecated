const chalk = require('chalk')
const co = require('co')
const tildify = require('tildify')
const findBabelConfig = require('babel-load-config')
const findPostcssConfig = require('postcss-load-config')

exports.postcss = co.wrap(function*() {
  let defaultPostcssOptions = {}
  try {
    defaultPostcssOptions = yield findPostcssConfig({}, null, {
      argv: false
    }).then(res => {
      console.log('> Using extenal postcss configuration')
      console.log(chalk.dim(`> location: "${tildify(res.file)}"`))
      return res
    })
  } catch (err) {
    if (err.message.indexOf('No PostCSS Config found') === -1) {
      throw err
    }
  }
  return defaultPostcssOptions
})

exports.babel = co.wrap(function*() {
  // eslint-disable-line require-yield
  const defaultBabelOptions = {
    babelrc: true,
    cacheDirectory: true
  }

  const externalBabelConfig = findBabelConfig(process.cwd())
  if (externalBabelConfig) {
    // It's possible to turn off babelrc support via babelrc itself.
    // In that case, we should add our default preset.
    // That's why we need to do this.
    const { options } = externalBabelConfig
    defaultBabelOptions.babelrc = options.babelrc !== false
  } else {
    defaultBabelOptions.babelrc = false
  }

  // Add our default preset if the no "babelrc" found.
  // if (!defaultBabelOptions.babelrc) {
  //   defaultBabelOptions.presets = [require.resolve('babel-preset-vue-app')]
  // }
  if (defaultBabelOptions.babelrc) {
    console.log(`> Using external babel configuration`)
    console.log(chalk.dim(`> location: "${tildify(externalBabelConfig.loc)}"`))
  }

  return defaultBabelOptions
})
