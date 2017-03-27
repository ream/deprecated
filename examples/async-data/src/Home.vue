<template>
  <div class="page">
    <h1>Home</h1>
    <h2>{{ title }}</h2>
    <p>{{ body }}</p>
    <router-link to="/about">Go About</router-link>
    <router-view />
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    name: 'home',
    async asyncData() {
      const res = await axios.get('http://jsonplaceholder.typicode.com/posts/1').then(res => res.data)
      return res
    }
  }
</script>
