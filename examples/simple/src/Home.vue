<template>
  <div>
    <h1>Hello {{ $store.state.name }}!</h1>
  </div>
</template>

<script>
  export default {
    preFetch({ store }) {
      return store.dispatch('rename', 'egoistian')
    },
    head() {
      return {
        title: 'HomePage!'
      }
    }
  }
</script>

<style scoped>
  div {
    background-color: pink;
  }
</style>
