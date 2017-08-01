// app.js
import Vue from 'vue'
import entry from 'entry-of-user-app'

export function createApp () {
  // create router instance
  const router = entry.createRouter()

  const app = new Vue({
    // inject router into root Vue instance
    router,
    render(h) {
      return h('div', {
        attrs: { id: 'ream-root' }
      }, [h('router-view')])
    }
  })

  // return both the app and the router
  return { app, router }
}
