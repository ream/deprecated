<template>
  <div class="page">
    <h1>About</h1>
    <p>{{description}}</p>
    <router-link to="/">Go Home</router-link>
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    async asyncData() {
      const description = await axios.get('https://api.github.com/repos/ream/ream').then(res => res.data.description)
      return { description }
    }
  }
</script>
