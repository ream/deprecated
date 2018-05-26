/* globals window */
import ReamError from './ReamError'

export default url => {
  if (process.server) {
    throw new ReamError({
      code: 'REDIRECT',
      url
    })
  } else {
    window.location.replace(url)
  }
}
