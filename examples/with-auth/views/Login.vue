<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <div>
        <input type="text" placeholder="username" v-model="username">
      </div>
      <button type="submit">Sign in</button>
    </form>
    <hr>
    <router-link to="/">Home</router-link>
  </div>
</template>

<script>
import cookie from 'cookie'

export default {
  data() {
    return {
      username: ''
    }
  },
  methods: {
    handleSubmit() {
      if (!this.username) return
      // In a real-world app
      // The token should be returned by an API call
      const token = 'THIS_IS_A_SUPER_SECRET_TOKEN'
      document.cookie = cookie.serialize('token', token, {
        maxAge: 30 * 24 * 60 * 60 // 30 days
      })
      this.$router.push('/secret')
    }
  }
}
</script>
