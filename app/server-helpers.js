import ReamError from './ReamError'

export default {
  error: err => {
    throw new ReamError(err)
  },
  redirect: url => {
    throw new ReamError({
      code: 'REDIRECT',
      // No error path since we don't really display this error
      errorPath: null,
      redirectURL: url
    })
  }
}
