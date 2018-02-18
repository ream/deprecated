# Use Vuex

To use Vuex, you can export a factory function that creates a Vuex instance in the entry file, just like how you did for `vue-router`:

```js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default {
  store() {
    return new Vuex.Store({
      state: {}
    })
  }
}
```
