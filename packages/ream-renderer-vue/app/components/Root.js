import entry from 'entry-of-user-app'
import DefaultErrorComponent from './Error'

const ErrorComponent = entry.ErrorComponent || DefaultErrorComponent

export default {
  name: 'RootComponent',

  render() {
    const error = this.$ream.error

    if (error) return <ErrorComponent error={error} />

    return <router-view />
  }
}
