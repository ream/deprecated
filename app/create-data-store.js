import Vue from 'vue'
import hash from 'hash-sum'

export default () =>
  new Vue({
    data: {
      state: {}
    },
    methods: {
      setData(filepath, data) {
        this.state[hash(filepath)] = data
      },
      getData(filepath) {
        return this.state[hash(filepath)]
      },
      replaceState(state) {
        this.state = state
      },
      getState() {
        return this.state
      }
    }
  })
