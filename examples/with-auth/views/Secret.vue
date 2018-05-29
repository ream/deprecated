<template>
  <div>
    Top secret! This is your token: {{ token }}
    <hr>
    <button @click="$router.push('/')">Home</button> <button @click="logout">Logout</button>
  </div>
</template>

<script>
import cookie from 'cookie'
import getToken from '../lib/getToken'

export default {
  getInitialData({ req }) {
    return {
      token: getToken(req)
    }
  },
  methods: {
    logout() {
      document.cookie = cookie.serialize('token', '', {
        maxAge: -1 // Expire the cookie immediately
      })
      this.$router.push('/')
    }
  }
}
</script>
