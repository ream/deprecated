const serialize = require('serialize-javascript')

module.exports = (template, context) => {
  const { title, link, style, script, noscript, meta } = context.meta.inject()

  let [start, end] = template.split('<!--ream-app-placeholder-->')

  start = start
    .replace(
      '<!--ream-head-placeholder-->',
      `${meta.text()}
      ${title.text()}
      ${link.text()}
      ${style.text()}
      ${script.text()}
      ${noscript.text()}`
    )
    .replace('<!--ream-styles-placeholder-->', context.renderStyles() || '')
    .replace('<!--ream-hints-placeholder-->', context.renderResourceHints())

  end =
    `<script>window.__REAM__=${serialize(
      {
        state: context.state,
        initialData: context.initialData,
        error: context.error
      },
      { isJSON: true }
    )}</script>` +
    end.replace('<!--ream-scripts-placeholder-->', context.renderScripts())

  return {
    start,
    end
  }
}
