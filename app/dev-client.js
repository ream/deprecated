import 'eventsource-polyfill'
import hotClient from '@alias/webpack-hot-middleware-client'

hotClient.subscribe(event => {
  if (event.action === 'reload') {
    window.location.reload()
  }
})
