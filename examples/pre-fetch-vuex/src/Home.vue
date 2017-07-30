<template>
  <div class="page">
    <h1>Home</h1>
    <p>{{bio}}</p>
    <router-link to="/about">Go About</router-link>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    asyncData({ store }) {
      return store.dispatch('updateBio')
    },
    computed: mapState(['bio'])
  }
</script>
