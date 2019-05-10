const serialize = require('serialize-javascript')
const defaultDocument = require('./document')

module.exports = async (renderer, context) => {
  const reamRootHtml = await renderer.renderToString(context)

  const document = context.document || defaultDocument
  const { title, link, style, script, noscript, meta } = context.meta.inject()

  let html =
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

  // TODO: instead of replace, just call document({ html: reamRootHtml })
  // This will be a breaking API change.
  html = html.replace('<!--ream-root-placeholder-->', reamRootHtml)

  return html
}
