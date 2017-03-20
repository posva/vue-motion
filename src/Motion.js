import stepper from './stepper'
import presets from './presets'
import { raf, now } from './utils'

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
    spring: {
      type: [Object, String],
      default: 'noWobble',
    },
  },

  computed: {
    springConfig () {
      return typeof this.spring === 'string'
        ? presets[this.spring]
        : this.spring
    },
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
        this.prevTime = now()
        this.accumulatedTime = 0
        this.animate()
      }
    },
  },

  mounted () {
    this.currentValue = this.value
    this.prevTime = now()
    this.accumulatedTime = 0
    this.idealValue = this.currentValue
    this.idealVelocity = this.currentVelocity
    this.animate()
  },

  methods: {
    animate () {
      this.animationId = raf(() => {
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

        // get time from last frame
        const currentTime = now()
        const timeDelta = currentTime - this.prevTime
        this.prevTime = currentTime
        this.accumulatedTime += timeDelta

        // more than 10 frames? prolly switched browser tab. Restart
        if (this.accumulatedTime > msPerFrame * 10) {
          this.accumulatedTime = 0
        }

        if (this.accumulatedTime === 0) {
          // no need to cancel animationID here; shouldn't have any in flight
          this.animationID = null
          this.$emit('motion-restart')
          this.animate()
          return
        }

        const currentFrameCompletion =
          (this.accumulatedTime - Math.floor(this.accumulatedTime / msPerFrame) * msPerFrame) / msPerFrame
        const framesToCatchUp = Math.floor(this.accumulatedTime / msPerFrame)

        let newIdealValue = this.idealValue
        let newIdealVelocity = this.idealVelocity

        // iterate as if the animation took place
        for (let i = 0; i < framesToCatchUp; i++) {
          ;[newIdealValue, newIdealVelocity] = stepper(
            msPerFrame / 1000,
            newIdealValue,
            newIdealVelocity,
            this.value,
            this.springConfig.stiffness,
            this.springConfig.damping,
            this.springConfig.precision
          )
        }

        const [nextIdealValue, nextIdealVelocity] = stepper(
          msPerFrame / 1000,
          newIdealValue,
          newIdealVelocity,
          this.value,
          this.springConfig.stiffness,
          this.springConfig.damping,
          this.springConfig.precision
        )

        this.currentValue =
          newIdealValue +
          (nextIdealValue - newIdealValue) * currentFrameCompletion
        this.currentVelocity =
          newIdealVelocity +
          (nextIdealVelocity - newIdealVelocity) * currentFrameCompletion
        this.idealValue = newIdealValue
        this.idealVelocity = newIdealVelocity

        // out of the update loop
        this.animationID = null
        // the amount we're looped over above
        this.accumulatedTime -= framesToCatchUp * msPerFrame

        // keep going!
        this.animate()
      })
    },
  },
}

function shouldStopAnimation (currentValue, value, currentVelocity) {
  if (currentVelocity !== 0) return false

  // stepper will have already taken care of rounding precision errors, so
  // won't have such thing as 0.9999 !=== 1
  if (currentValue !== value) return false

  return true
}
