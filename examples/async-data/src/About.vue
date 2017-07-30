<template>
  <div class="page">
    <h1>About</h1>
    <h2>{{ foo }}</h2>
    <router-link to="/">Home</router-link>
  </div>
</template>

<script>
export default {
  name: 'about',
  asyncData() {
    return Promise.resolve({ foo: 'hi' })
  },
  data() {
    return {
      foo: this.$asyncData.foo
    }
  }
}
</script>
