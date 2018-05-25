<template>
  <div v-if="post">
    <h1>{{ post.title }}</h1>
    <p>
      Votes: {{ post.votes }}
    </p>
    <div>
      <router-link to="/">Go Home -></router-link>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'

export default {
  apollo: {
    Post: {
      query: gql`query ($id: ID) {
        Post (id: $id) {
          id
          title
          votes
        }
      }`,
      variables() {
        return {
          id: this.$route.params.id
        }
      },
      prefetch: ({ route }) => {
        return {
          id: route.params.id,
        }
      },
      manual: true,
      result ({ data, loading }) {
        if (!loading) {
          this.post = data.Post
        }
      }
    }
  },

  data() {
    return {
      post: null
    }
  },

  head() {
    return {
      title: this.post ? this.post.title : ''
    }
  }
}
</script>
