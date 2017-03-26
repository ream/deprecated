<template>
  <div class="page">
    <h1>Home</h1>
    <p>{{bio}}</p>
    <router-link to="/about">Go About</router-link>
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    async asyncData() {
      const res = await axios.get('https://api.github.com/users/egoist').then(res => res.data)
      return res
    }
  }
</script>
