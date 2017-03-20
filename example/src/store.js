import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    SET_COUNT(state, payload) {
      state.count = payload
    }
  },
  actions: {
    fetch({commit}, cache) {
      if (cache) return commit('SET_COUNT', cache)
      return new Promise(resolve => {
        setTimeout(() => {
          commit('SET_COUNT', 999)
          resolve(999)
        }, 2000)
      })
    }
  }
})

export default store
