const chalk = require('chalk')
const tildify = require('tildify')
const LoadExternalConfig = require('poi-load-config')
const buildConfigChain = require('babel-core/lib/transformation/file/options/build-config-chain')

async function loadBabel(load) {
  let babel

  const { useConfig, file } = await load.babel(buildConfigChain)

  if (useConfig) {
    console.log('> Using external babel configuration')
    console.log(chalk.dim(`> location: "${tildify(file)}"`))
    babel = {
      cacheDirectory: true,
      babelrc: true
    }
  } else {
    babel = {
      cacheDirectory: true,
      babelrc: false
    }
  }
  if (babel.babelrc === false) {
    // Use our default preset when no babelrc was found
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
