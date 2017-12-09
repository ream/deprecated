<template>
  <div class="page">
    Home!!! <router-link to="/about">{{ $initialData.foo }}</router-link> <router-link to="/404">404</router-link>
  </div>
</template>

<script>
export default {
  name: 'Home',

  async getInitialData() {
    // throw new Error('fuck')
    return { foo: 'about' }
  }
}
</script>
