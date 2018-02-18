# Update `<head>` element

You can set the `head` option per component:

```vue
<script>
export default {
  head: {
    title: 'My Website'
  }
}
</script>
```

Ream uses [vue-meta](https://github.com/declandewet/vue-meta) to manage `<head>` under the hood.
