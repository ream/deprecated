<template>
<ul>
  <li><router-link to="/catalog/specials">Specials</router-link></li>
  <li v-for="item in items" :key="item">
    Item: {{ item }}
    <router-link :to="`/catalog/${item}`">Info</router-link>
    <router-link :to="`/catalog/${item}/images`">Images</router-link>
  </li>
</ul>
</template>

<script>
export default {
  data () {
    return {
      items: [10, 20, 30]
    }
  }
}
</script>
