<template>
  <div class="view">
    Home {{ $store.state.count }}
  </div>
</template>

<script>
  export default {
    name: 'home',
    head: {
      title: 'Home'
    },
    preFetchCache({ cache, store }) {
      return store.dispatch('fetch', cache)
    }
  }
</script>

<style>
  .view {
    font-size: 50px;
  }
</style>
