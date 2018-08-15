import Vue from 'vue'
import Router from 'vue-router'
import Vuex from 'vuex'

Vue.use(Router)
Vue.use(Vuex)

export default () => ({
  store: new Vuex.Store({
    state: {
      count: 0
    },
    mutations: {
      INC(state) {
        state.count++
      }
    },
    actions: {
      reamServerInit({ commit }, context) {
        commit('INC')
      }
    }
  }),
  router: new Router({
    mode: 'history',
    routes: [
      {
        path: '/',
        component: {
          render(h) {
            return h('h1', null, ['hello', this.$store.state.count])
          }
        }
      }
    ]
  })
})
