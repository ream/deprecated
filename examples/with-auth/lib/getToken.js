import cookie from 'cookie'

export default req => {
  const { token } = cookie.parse(req ? req.headers.cookie || '' : document.cookie)

  return token
}
