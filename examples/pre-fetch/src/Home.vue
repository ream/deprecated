<template>
  <div class="page">
    <h1>Home</h1>
    <h2>{{ $fetched.msg }}</h2>
    <ul>
      <li>
        <router-link to="/lol">Child View</router-link>
      </li>
      <li>
        <router-link to="/about">About</router-link>
      </li>
    </ul>

    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'home',
  fetch() {
    return Promise.resolve({ msg: 'hello from home' })
  },
  data() {
    return {
      msg: this.$fetched.msg
    }
  }
}
</script>
