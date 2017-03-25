<template>
  <div class="home">
    <h2>{{ $options.blog.title }} </h2>
    <div class="markdown-body" v-html="$options.blog.content"></div>
  </div>
</template>

<blog>
---
title: Hello World!
---

[ream](https://github.com/egoist/ream/tree/dev/examples/custom-blocks) + SSR + **custom blocks** in vue-loader = awesome!

![yep](https://media.giphy.com/media/3o7TKB15qTJv5E397y/giphy.gif)
</blog>

<script>
  export default {
    head() {
      return { title: this.$options.blog.title }
    }
  }
</script>

<style src="github-markdown-css/github-markdown.css"></style>
