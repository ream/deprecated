const serialize = require('serialize-javascript')
const defaultDocument = require('./document')

module.exports = context => {
  const document = context.entry.document || defaultDocument
  const { title, link, style, script, noscript, meta } = context.meta.inject()

  const html =
    '<!DOCTYPE html>' +
    document({
      data: context.documentData,
      headTags({ resourceHints = true } = {}) {
        return (
          `${meta.text()}
      ${title.text()}
      ${link.text()}
      ${style.text()}
      ${script.text()}
      ${noscript.text()}` +
          (resourceHints ? context.renderResourceHints() : '') +
          context.renderStyles()
        )
      },
      scripts() {
        return (
          `<script>window.__REAM__=${serialize(context.globalState, {
            isJSON: true
          })}</script>` + context.renderScripts()
        )
      }
    })

  const [start, end] = html.split('<!--ream-root-placeholder-->')

  return {
    start,
    end
  }
}
