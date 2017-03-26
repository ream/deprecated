ream + css + scss example

ream supports common css preprocessors like `scss` `sass` `less` `stylus`, by default it uses `postcss`.

In dev mode, CSS will always be **inlined** into HTML.

In production mode, CSS in single-file component will still be inlined into HTML, while we will extract directly imported CSS files like `import './foo.css'` into a single `.css` file.

## Install dependencies

```bash
yarn
```

## Production

```bash
npm run build
npm start
```

## Development

```bash
npm run dev
```

Modify `.css` or `<style>` tag in single-file component to see effects.
