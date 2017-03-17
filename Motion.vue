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

  watch: {
    value (old, current) {
      if (old !== current && !this.wasAnimating) {
        this.prevTime = performance.now()
        this.animate()
      }
    }
  },

  mounted () {
    this.currentValue = this.value
    this.animate()
  },

  methods: {
    animate () {
      this.animationId = requestAnimationFrame(timestamp => {
        if (shouldStopAnimation(
          this.currentValue,
          this.value,
          this.currentVelocity
        )) {
          if (this.wasAnimating) this.$emit('motion-end')

          // reset everything for next animation
          this.animationId = null
          this.wasAnimating = false
          return
        }

        if (!this.wasAnimating) this.$emit('motion-start')
        this.wasAnimating = true

        ;[this.currentValue, this.currentVelocity] = stepper(
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

function shouldStopAnimation(currentValue, value, currentVelocity) {
  if (currentVelocity !== 0) return false

  // stepper will have already taken care of rounding precision errors, so
  // won't have such thing as 0.9999 !=== 1
  if (currentValue !== value) return false

  return true;
}
</script>
