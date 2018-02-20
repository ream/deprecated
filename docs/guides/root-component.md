# Root component

The default root component is `<router-view>`, and we wrap it like this:

```vue
<div id="_ream">
  <router-view />
</div>
```

We need to ensure that the top level element is `#_ream` since your app is mounted to this element on the client side.

Sometimes you want to share components among route components, like a `<site-header>` component, of course you can import the header in each of your route component, but why not just add the header to the root component so that every page can show it?

In your entry file, you can export your own root component:

```diff
+ import root from './Root.vue'

export default {
  createRouter, // Your router
+ root
}
```

Your root component `Root.vue` may look like:

```vue
<template>
  <div>
    <site-header />
    <router-view />
  </div>
</template>

<script>
import SiteHeader from './components/SiteHeader.vue'

export default {
  components: {
    SiteHeader
  }
}
</script>
````

## Async root component

Root component can also be a function which return an actual component object:

```js
export default {
  root: async params => {
    const items = await fetchItems()
    return {
      render(h) {
        return h('list', {
          props: { items }
        })
      }
    }
  }
}
```

The `params` contains:

- `store`: Vuex store instance, if any.
- `req`: HTTP IncomingMessage, only on server-side.
