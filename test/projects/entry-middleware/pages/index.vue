<template>
<div>
  Page loaded from <strong>{{ type }}</strong>
  <router-link :to="`/?random=${Math.random()}`">reload</router-link>
</div>
</template>

<script>
export default {
  getInitialData ({ type }) {
    return { type }
  }
}
</script>
