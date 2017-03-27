<template>
  <div class="page">
    <h1>About</h1>
    <h2>{{ title }}</h2>
    <p>{{ body }}</p>
    <router-link to="/">Go Home</router-link>
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    name: 'about',
    async asyncData() {
      const res = await axios.get('http://jsonplaceholder.typicode.com/posts/6').then(res => res.data)
      return res
    }
  }
</script>
