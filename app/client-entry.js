import 'es6-promise/auto'
import createApp from './create-app'
import { store, router, App } from '@cwd/src'

const app = createApp({
  store,
  router,
  App
})

// prime the store with server-initialized state.
// the state is determined during SSR and inlined in the page markup.
if (window.__INITIAL_STATE__ && store) {
  store.replaceState(window.__INITIAL_STATE__)
}

// wait until router has resolved all async before hooks
// and async components...
router.onReady(() => {
  // actually mount to DOM
  app.$mount('#app')
})

