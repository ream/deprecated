const serialize = require('serialize-javascript')
const defaultDocument = require('./document')

module.exports = context => {
  const document = context.entry.document || defaultDocument
  const { title, link, style, script, noscript, meta } = context.meta.inject()

  const html =
    '<!DOCTYPE html>' +
    document({
      initialData: context.initialData,
      headTags({ resourceHints = true } = {}) {
        return (
          `${meta.text()}
      ${title.text()}
      ${link.text()}
      ${style.text()}
      ${script.text()}
      ${noscript.text()}` + (resourceHints ? context.renderResourceHints() : '')
        )
      },
      scripts() {
        return (
          `<script>window.__REAM__=${serialize(
            {
              state: context.state,
              error: context.error
            },
            { isJSON: true }
          )}</script>` + context.renderScripts()
        )
      }
    })

  const [start, end] = html.split('<!--ream-root-placeholder-->')

  return {
    start,
    end
  }
}
