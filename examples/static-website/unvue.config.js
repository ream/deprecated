module.exports = {
  generate: {
    routes: {
      '/': true,
      '/user/:name': [{
        name: 'kevin'
      }, {
        name: 'egoist'
      }]
    }
  }
}
