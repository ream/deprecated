<template>
  <div>
    Top secret!
  </div>
</template>

<script>
export default {
  beforeRouteEnter(to, from, next) {
    setTimeout(() => {
      next('/')
    }, 1000)
  }
}
</script>
