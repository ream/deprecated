<template>
  <div>test</div>
</template>

<script>
export default {
  getInitialData ({ req }) {
    const type = req ? 'server' : 'client'
    throw new Error(`unhandled ${type}-side error`)
  }
}
</script>
