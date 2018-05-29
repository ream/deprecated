/* globals window */
import ReamError from './ReamError'

export default {
  redirect: url => {
    if (process.server) {
      throw new ReamError({
        code: 'REDIRECT',
        url
      })
    } else {
      window.location.replace(url)
    }
  },
  error: err => {
    throw new ReamError(err)
  }
}
