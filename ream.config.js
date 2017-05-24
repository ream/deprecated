module.exports = {
  cwd: 'examples/custom-server',
  entry: 'src/index.js',
  generate: {
    routes: ['/', '/about/']
  }
}
