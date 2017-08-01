import { createApp } from './create-app'

const { app, router } = createApp()

router.onReady(() => {
  console.log('client')
  app.$mount('#ream-root')
})
