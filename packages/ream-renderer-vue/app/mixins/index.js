import InitialData from './initial-data'
import Ream from './ream'

export default Vue => {
  Vue.mixin(InitialData)
  Vue.mixin(Ream)
}
