<template>
  <h1 id="target">Page 2: Should not see me</h1>
</template>

<script>
export default {
  getInitialData ({ redirect }) {
    return redirect('/3')
  }
}
</script>
