import 'es6-promise/auto'
import createApp from './create-app'
import entry from '@alias/entry'
import defaultHandler from './default-handler'

const { store, router, handlers = [] } = entry

const handlerContext = {
  store,
  router,
  isDev: process.env.NODE_ENV === 'development',
  isClient: true,
  handleError: (...args) => console.error(...args)
}
for (const handler of [defaultHandler, ...handlers]) {
  handler(handlerContext)
}

const app = createApp(entry)

// wait until router has resolved all async before hooks
// and async components...
router.onReady(() => {
  // actually mount to DOM
  app.$mount('#app')
})

