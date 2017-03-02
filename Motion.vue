<script>
import spring from './spring'
import stepper from './stepper'

const s = spring(10)
const msPerFrame = 1000 / 60

export default {
  data () {
    return {
      currentValue: 0,
      currentVelocity: 0,
    }
  },

  props: ['value', 'tag'],

  render (h) {
    return h(this.tag || 'span', [
      this.$scopedSlots.default({
        value: this.currentValue,
      }),
    ])
  },

  mounted () {
    this.animate()
  },

  methods: {
    animate () {
      requestAnimationFrame(() => {
        [this.currentValue, this.currentVelocity] = stepper(
          msPerFrame / 1000,
          this.currentValue,
          this.currentVelocity,
          this.value,
          s.stiffness,
          s.damping,
          s.precision
        )
        this.animate()
      })
    },
  },
}
</script>
