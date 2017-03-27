import 'es6-promise/auto'
import Vue from 'vue'
import createApp from './create-app'
import defaultHandler from './default-handler'
import {
  getMatchedComponents,
  applyAsyncData
 } from './utils'
import entry from '@alias/entry'

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
  if (module.hot) {
    Vue.nextTick(() => {
      hotReloadAPI(app)
      router.afterEach(() => {
        Vue.nextTick(() => {
          hotReloadAPI(app)
        })
      })
    })
  }
})

// Heavily extracted from Nuxt.js
function hotReloadAPI (_app) {
  let cps = []
  let $ream = _app.$ream
  const getCp = (children) => {
    if (!children || !children.length) return
    children.forEach(function (child, i) {
      if (child.$vnode.data.routerView) {
        cps.push(child)
        getCp(child.$children)
      }
    })
  }

  getCp($ream.$children)
  cps.forEach(addHotReload.bind(_app))
}

function addHotReload ($component, depth) {
  if ($component.$vnode.data._hasHotReload) return

  $component.$vnode.data._hasHotReload = true

  const _forceUpdate = $component.$forceUpdate.bind($component.$parent)

  $component.$vnode.context.$forceUpdate = () => {
    let Components = getMatchedComponents(router.currentRoute.matched)
    let Component = Components[depth]
    const ps = []

    if (Component && !Component.options) {
      Component = Vue.extend(Component)
      Component._Ctor = Component
    }

    if (Component.options.asyncData) {
      const asyncData = Component.options.asyncData({
        store,
        route: router.currentRoute,
        isClient: true
      })

      if (asyncData.then) {
        ps.push(asyncData.then(data => {
          applyAsyncData(Component, data)
        }))
      } else {
        applyAsyncData(Component, asyncData)
      }
    }

    if (Component.options.preFetch) {
      const preFetch = Component.options.preFetch({
        store,
        route: router.currentRoute,
        isClient: true
      })

      if (preFetch.then) {
        ps.push(preFetch)
      }
    }

    Promise.all(ps).then(() => {
      _forceUpdate()
      Vue.nextTick(() => hotReloadAPI(this))
    }).catch(console.error)
  }
}

