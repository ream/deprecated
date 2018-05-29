<template>
  <ul>
    <li v-if="token">
      You've logged in!
    </li>
    <li v-else>
      <router-link to="/login">Login</router-link>
    </li>
    <li>
      <router-link to="/secret">Secret page</router-link>
    </li>
  </ul>
</template>

<script>
import getToken from '../lib/getToken'

export default {
  getInitialData({ req }) {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('fetched!')
        resolve({
          token: getToken(req)
        })
      }, 1000)
    })
  }
}
</script>
