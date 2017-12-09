import entry from 'entry-of-user-app'
import DefaultErrorComponent from './Error'

const ErrorComponent = entry.ErrorComponent || DefaultErrorComponent

export default {
  name: 'RootComponent',

  render() {
    if (this.$reamError) return <ErrorComponent error={this.$reamError} />

    return <router-view />
  }
}
