const path = require('path')

const slash = input => {
  const isExtendedLengthPath = /^\\\\\?\\/.test(input)
  const hasNonAscii = /[^\u0000-\u0080]+/.test(input) // eslint-disable-line no-control-regex

  if (isExtendedLengthPath || hasNonAscii) {
    return input
  }

  return input.replace(/\\/g, '/')
}

const pathToId = file => {
  return path.basename(slash(file)).replace(/\W/g, '_')
}

module.exports = api => {
  const enhanceAppFiles = [...api.enhanceAppFiles].map((filepath, index) => ({
    id: `${pathToId(filepath)}_${index}`,
    filepath: slash(filepath)
  }))

  return `
  import { getRequireDefault } from '#app/utils'

  ${[...enhanceAppFiles]
    .map(file =>
      `
  const ${file.id} = getRequireDefault(require('${file.filepath}'))
  `.trim()
    )
    .join('\n')}

  export default function enhanceApp (enhanceContext) {
    ${[...enhanceAppFiles]
      .map(file =>
        `
    if (typeof ${file.id} === 'function') {
      ${file.id}(enhanceContext)
    }
    `.trim()
      )
      .join('\n')}
  }
  `
}
