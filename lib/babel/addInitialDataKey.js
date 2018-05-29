const hash = require('hash-sum')

module.exports = ({ types: t }) => ({
  name: 'add-initial-data-key',
  visitor: {
    ObjectMethod(
      path,
      {
        file: {
          opts: { filename }
        }
      }
    ) {
      let hasKey
      for (const prop of path.parent.properties) {
        if (
          prop.type === 'ObjectProperty' &&
          prop.key.name === 'initialDataKey'
        ) {
          hasKey = true
        }
      }
      if (!hasKey && path.node.key.name === 'getInitialData') {
        path.insertAfter(
          t.objectProperty(
            t.identifier('initialDataKey'),
            t.stringLiteral(hash(filename))
          )
        )
      }
    }
  }
})
