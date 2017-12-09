<template>
  <div class="page">
    Home!!! <router-link to="/foo">{{ $initialData.foo }}</router-link>
  </div>
</template>

<script>
export default {
  name: 'Home',

  async getInitialData() {
    return { foo: 'foo' }
  }
}
</script>
