const Koa = require('koa')
const Router = require('koa-router')
const unvue = require('../../')

const app = unvue({
  dev: process.env.NODE_ENV !== 'production'
})

console.log('> Starting...')
app.prepare()
  .then(() => {
    const server = new Koa()
    const router = new Router()

    router.get('*', ctx => {
      app.getRequestHandler()(ctx.req, ctx.res)
      ctx.respond = false
    })

    server.use(async (ctx, next) => {
      ctx.res.statusCode = 200
      await next()
    })

    server.use(router.routes())

    server.listen(8101)
    console.log(`> Open http://localhost:8101`)
  })

app.on('valid', () => {
  unvue.displayStats(app.stats)
  console.log(`> Open http://localhost:8101`)
})
