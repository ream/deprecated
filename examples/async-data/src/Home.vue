<template>
  <div class="page">
    <h1>Home</h1>
    <h2>{{ $asyncData.msg }}</h2>
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
  asyncData() {
    return Promise.resolve({ msg: 'hello from home' })
  },
  data() {
    return {
      msg: this.$asyncData.msg
    }
  }
}
</script>
