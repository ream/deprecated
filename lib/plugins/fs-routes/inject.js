import routes from '#out/routes' // eslint-disable-line import/no-unresolved

export default ({ rootOptions }) => {
  rootOptions.router.addRoutes(routes)
}
