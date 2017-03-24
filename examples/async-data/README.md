`asyncData` is similar to the concept [getInitialProps](https://github.com/zeit/next.js#fetching-data-and-component-lifecycle) in Next.js but works in the Vue way, let's say you have a router-view component:

```js
// Make sure you're using isomorphic utilities
import axios from 'axios'

export default {
  // name is required for cache
  name: 'my-page',
  data() {
    // Define default value
    return { users: [] }
  },
  // Always return a Promise
  async asyncData() {
    const users = await axios.get('https://api.github.com/users')
      .then(res => res.data)
    return { users }
  }
}
```

In this way, we will fetch the data on the server-side first, on the client-side, it will only fetch data after the fist paint.

`asyncData` is an async function which means you always need to return a Promise. You can also use Vuex with it if you export a `store` instance in your entry file:

```js
export default {
  name: 'my-page',
  computed: {
    users() {
      return this.$store.state.users
    }
  },
  async asyncData() {
    await store.dispatch('fetchUsers')
  }
}
```
