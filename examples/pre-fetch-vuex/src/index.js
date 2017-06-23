import Vue from 'vue'
import Router from 'vue-router'
import Vuex from 'vuex'
import axios from 'axios'
import Home from './Home.vue'
import About from './About.vue'

Vue.use(Router)
Vue.use(Vuex)

const createRouter = () => new Router({
  mode: 'history',
  routes: [{
    path: '/',
    component: Home,
    children: [{
      path: 'lol',
      component: About
    }]
  }, {
    path: '/about',
    component: About
  }]
})

const createStore = () => new Vuex.Store({
  state: {
    bio: '',
    description: ''
  },
  mutations: {
    UPDATE_BIO(state, payload) {
      state.bio = payload
    },
    UPDATE_DESCRIPTION(state, payload) {
      state.description = payload
    }
  },
  actions: {
    async updateBio({ commit }, payload) {
      const { bio } = await axios.get('https://api.github.com/users/egoist').then(res => res.data)
      commit('UPDATE_BIO', bio)
    },
    async updateDescription({ commit }, payload) {
      const { description } = await axios.get('https://api.github.com/repos/ream/ream').then(res => res.data)
      commit('UPDATE_DESCRIPTION', description)
    }
  }
})

export default { createRouter, createStore }
