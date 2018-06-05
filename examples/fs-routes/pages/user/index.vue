<template>
<div>
  <li v-for="user in users" :key="user">
    <router-link :to="`/user/${user}`" v-text="user" />
  </li>
</div>
</template>

<script>
export default {
  data () {
    return {
      users: [ 'mary', 'ann', 'joe' ]
    }
  }
}
</script>
