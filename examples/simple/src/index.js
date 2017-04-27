import Vue from 'vue'
import Vuex from 'vuex'
import Router from 'vue-router'

Vue.use(Vuex)
Vue.use(Router)

const createStore = () => {
  return new Vuex.Store({
    state: {
      name: 'egoist'
    },
    mutations: {
      RENAME(state, name) {
        state.name = name
      }
    },
    actions: {
      rename({ commit }, name) {
        commit('RENAME', name)
      }
    }
  })
}

const createRouter = () => {
  return new Router({
    mode: 'history',
    routes: [{
      path: '/',
      component: () => import('./Home.vue')
    }]
  })
}

export default {
  createRouter,
  createStore
}
