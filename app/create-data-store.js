import Vue from 'vue'

export default () =>
  new Vue({
    data: {
      state: {}
    },
    methods: {
      setData(id, data) {
        this.state[id] = data
      },
      getData(id) {
        return this.state[id]
      },
      replaceState(state) {
        this.state = state
      },
      getState() {
        return this.state
      }
    }
  })
