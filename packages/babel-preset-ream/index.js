module.exports = {
  presets: [
    [require('babel-preset-env')]
  ],
  plugins: [
    [require('babel-plugin-transform-object-rest-spread'), {
      useBuiltIns: true
    }]
  ]
}
