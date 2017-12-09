export default {
  name: 'ErrorComponent',

  props: {
    error: {
      type: Object,
      required: true
    }
  },

  render() {
    return (
      <div>
        {this.error.statusCode && this.error.statusMessage}
      </div>
    )
  }
}
