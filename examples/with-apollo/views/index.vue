<template>
  <div>
    <div v-for="post in allPosts">
      <h2>
        <router-link :to="`/post/${post.id}`">{{ post.title }}</router-link>
      </h2>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'

export default {
  apollo: {
    allPosts: gql`{
      allPosts (first: 5) {
        id
        title
      }
    }`
  },

  data() {
    return {
      allPosts: []
    }
  }
}
</script>
