import AsynData from './async-data'
import HandleError from './error'

export default Vue => {
  Vue.mixin(AsynData)
  Vue.mixin(HandleError)
}
