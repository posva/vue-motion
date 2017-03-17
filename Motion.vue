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

  props: {
    value: {
      type: Number,
    },
    tag: {
      type: String,
      default: 'span',
    },
    spring: Object,
  },

  render (h) {
    return h(this.tag, [
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
          this.spring.stiffness,
          this.spring.damping,
          this.spring.precision
        )
        this.animate()
      })
    },
  },
}
</script>
