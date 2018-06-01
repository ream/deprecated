/* eslint-disable */
if (
  process.browser &&
  process.env.NODE_ENV === 'production' &&
  __PWA_ENABLED__ &&
  window.location.protocol === 'https:'
) {
  const { register } = require('register-service-worker')

  register(`${__PUBLIC_PATH__}sw.js`, {
    ready() {
      console.log('[ream:pwa] Service worker is active.')
    },
    cached() {
      console.log('[ream:pwa] Content has been cached for offline use.')
    },
    updated() {
      console.log('[ream:pwa] Content updated.')
    },
    offline() {
      console.log(
        '[ream:pwa] No internet connection found. App is running in offline mode.'
      )
    },
    error(err) {
      console.error('[ream:pwa] Error during service worker registration:', err)
    }
  })
}
