import 'eventsource-polyfill'
import hotClient from 'webpack-hot-middleware/client?reload=true&path=/_ream/__hmr'

hotClient.subscribe(event => {
  if (event.action === 'reload') {
    window.location.reload()
  }
})

hotClient.subscribeAll(event => {
  // Refresh browser when there's ream error
  if (event.action === 'built' && document.querySelector('.ream-error')) {
    window.location.reload()
  }
})
