# Serve public files

`public` folder in current directory will be served as public files, i.e. you can access them using `/public/*`.

Sometimes you need to serve files from root path, for example you may want `/favicon.ico` rather than `/public/favicon.ico`, in this case you can use `rootPublicFiles` option to hoist files to root path:

```js
// Your ream.config.js
module.exports = {
  rootPublicFiles: [
    'verify-site.txt'
  ]
}
```

Then both `/public/verify-site.txt` and `/verify-site.txt` will give you `verify-site.txt` in the `./public` folder.

Note that `rootPublicFiles` is set to a sensible default:

```js
[
  'favicon.ico',
  'CNAME',
  '.nojekyll',
  '.well-known'
]
```

You custom value will be merged into the default.
