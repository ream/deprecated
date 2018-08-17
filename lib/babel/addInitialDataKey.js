const hash = require('hash-sum')

const hasDataKey = properties => {
  return properties.some(prop => {
    return prop.type === 'ObjectProperty' && prop.key.name === 'initialDataKey'
  })
}

module.exports = ({ types: t }) => ({
  name: 'add-initial-data-key',
  visitor: {
    'ObjectProperty|ObjectMethod'(
      path,
      {
        file: {
          opts: { filename }
        }
      }
    ) {
      if (
        path.node.key.name !== 'getInitialData' ||
        hasDataKey(path.parent.properties)
      ) {
        return
      }

      path.insertAfter(
        t.objectProperty(
          t.identifier('initialDataKey'),
          t.stringLiteral(hash(filename))
        )
      )
    }
  }
})
