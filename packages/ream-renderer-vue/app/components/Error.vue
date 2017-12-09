<template>
  <div class="ream-error">
    <pre><code><span class="ream-error-span">{{ error.statusCode || 'Error' }}</span> {{ error.message }}</code></pre>
  </div>
</template>

<script>
export default {
  name: 'ErrorComponent',

  props: {
    error: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.ream-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 8px;
  background: white;
}

.ream-error pre {
  margin: 0;
}

.ream-error-span {
  background: red;
  padding: 2px 5px;
  border-radius: 3px;
  color: white;
}
</style>
