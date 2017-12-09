import entry from 'entry-of-user-app'
import DefaultErrorComponent from './Error.vue'

const ErrorComponent = entry.ErrorComponent || DefaultErrorComponent

export default {
  name: 'RootComponent',

  render() {
    if (this.$ream.error) return <ErrorComponent error={this.$ream.error} />

    return <router-view />
  }
}
