export default {
  functional: true,
  props: ['value', 'tag'],

  render (h, {
    props,
    data: {
      scopedSlots,
    },
  }) {
    return h(props.tag || 'span', [
      scopedSlots.default({
        value: props.value
      })
    ])
  }
}
