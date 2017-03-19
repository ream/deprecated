import 'eventsource-polyfill'
import hotClient from '@webpack-hot-middleware-client'

hotClient.subscribe(event => {
  if (event.action === 'reload') {
    window.location.reload()
  }
})
