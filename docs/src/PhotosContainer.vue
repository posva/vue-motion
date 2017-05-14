<template>
  <Motion tag="div"
          :value="left"
  >
    <template scope="props">
      <slot :left="props.value"></slot>
    </template>
  </Motion>
</template>

<script>
import Motion from '../../src/Motion'

export default {
  props: ['sizes', 'current'],

  computed: {
    left () {
      let cumulated = 0
      for (let i = 0; i < this.current; ++i) {
        cumulated += this.sizes[i].width
      }
      return -cumulated
    },
  },

  components: { Motion },
}
</script>
