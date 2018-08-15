<template>
<div>
  <h2 v-text="user" />
  <ul>
    <li><router-link :to="`/user/${user}`">Profile</router-link></li>
    <li><router-link :to="`/user/${user}/friends`">Friends</router-link></li>
  </ul>
  <router-view />
</div>
</template>

<script>
export default {
  computed: {
    user () {
      return this.$route.params.user_id
    }
  }
}
</script>
