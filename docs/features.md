# Features

## General

### Code split

You can use `import()` or `require.ensure()` to split modules for lazy-loading.

### JS

JS is transpiled by Babel using [babel-preset-vue-app](https://github.com/egoist/babel-preset-vue-app), which means you can use all latest ECMAScript features and stage-2 features.

### CSS

Support all CSS preprocessors, you can install its loader to use them, for example to use `scss`

```js
yarn add sass-loader node-sass --dev
```

### Public folder

`./dist` folder is served as static files, and files inside `./static` will be copied to `./dist` folder as well.

## Development

Hot Reloading enabled

## Production

3rd-party libraries are automatically extracted into a single `vendor` chunk.

All output files are minifies and optimized.
