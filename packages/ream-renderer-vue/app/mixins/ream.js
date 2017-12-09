export default {
  beforeCreate() {
    this.$ream = this.$options.ream || (this.$parent && this.$parent.$ream)
  }
}
