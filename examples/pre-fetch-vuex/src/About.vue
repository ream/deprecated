<template>
  <div class="page">
    <h1>About</h1>
    <p>{{description}}</p>
    <router-link to="/">Go Home</router-link>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'hi',
    fetch({ store }) {
      return store.dispatch('updateDescription')
    },
    computed: mapState(['description'])
  }
</script>
