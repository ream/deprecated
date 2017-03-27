export default {
  name: 'ream-view',
  functional: true,
  render(h, { data }) {
    data.isChildView = true
    return h('router-view')
  }
}
