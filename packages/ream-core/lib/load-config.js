const chalk = require('chalk')
const tildify = require('tildify')
const LoadExternalConfig = require('poi-load-config')
const buildConfigChain = require('babel-core/lib/transformation/file/options/build-config-chain')

async function loadBabel(load) {
  const babel = {}

  const externalBabelConfig = await load.babel(buildConfigChain)

  if (externalBabelConfig) {
    // If root babel config file is found
    // We set `babelrc` to the its path
    // To prevent `babel-loader` from loading it again
    console.log('> Using external babel configuration')
    console.log(
      chalk.dim(`> location: "${tildify(externalBabelConfig.loc)}"`)
    )
    // You can use `babelrc: false` to disable the config file itself
    if (externalBabelConfig.options.babelrc === false) {
      babel.babelrc = false
    } else {
      babel.babelrc = externalBabelConfig.loc
    }
  } else {
    // If not found
    // We set `babelrc` to `false` for the same reason
    babel.babelrc = false
  }

  if (babel.babelrc === false) {
    // Use our default preset when no babelrc was specified
    babel.presets = [
      [require.resolve('babel-preset-ream')]
    ]
  }

  return babel
}

async function loadPostCSS(load) {
  const postcssConfig = await load.postcss()
  if (postcssConfig.file) {
    console.log('> Using extenal postcss configuration')
    console.log(chalk.dim(`> location: "${tildify(postcssConfig.file)}"`))
    return postcssConfig
  }
}

module.exports = cwd => {
  const load = new LoadExternalConfig({ cwd })

  return Promise.all([
    loadBabel(load),
    loadPostCSS(load)
  ]).then(([babel, postcss]) => ({
    babel,
    postcss
  }))
}
