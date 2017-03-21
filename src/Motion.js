import stepper from './stepper'
import presets from './presets'
import { raf, now } from './utils'

const msPerFrame = 1000 / 60

export default {
  data () {
    return {
      currentValues: null,
      currentVelocities: null,
    }
  },

  props: {
    value: Number,
    values: Object,
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
    realValues () {
      return this.value != null
        ? { value: this.value }
        : this.values
    },
  },

  render (h) {
    return h(this.tag, [
      this.$scopedSlots.default(this.currentValues),
    ])
  },

  watch: {
    realValues (current, old) {
      console.log(old, current)
      console.log(old !== current)
      if (old !== current && !this.wasAnimating) {
        this.prevTime = now()
        this.accumulatedTime = 0
        this.animate()
      }
    },
  },

  created () {
    const values = {}
    const velocities = {}
    for (const key in this.realValues) {
      if (!Object.prototype.hasOwnProperty.call(this.realValues, key)) continue
      values[key] = this.realValues[key]
      velocities[key] = 0
    }
    this.currentValues = values
    this.currentVelocities = velocities
  },

  mounted () {
    this.prevTime = now()
    this.accumulatedTime = 0
    this.idealValues = this.currentValues
    this.idealVelocities = this.currentVelocities
    this.animate()
  },

  methods: {
    animate () {
      this.animationId = raf(() => {
        if (shouldStopAnimation(
          this.currentValues,
          this.realValues,
          this.currentVelocities
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

        for (const key in this.realValues) {
          if (!Object.prototype.hasOwnProperty.call(this.realValues, key)) continue
          let newIdealValue = this.idealValues[key]
          let newIdealVelocity = this.idealVelocities[key]
          const value = this.realValues[key]
          const springConfig = this.springConfig

          // iterate as if the animation took place
          for (let i = 0; i < framesToCatchUp; i++) {
            ;[newIdealValue, newIdealVelocity] = stepper(
              msPerFrame / 1000,
              newIdealValue,
              newIdealVelocity,
              value,
              springConfig.stiffness,
              springConfig.damping,
              springConfig.precision
            )
          }

          console.log(`From ${newIdealValue} to ${value} at ${newIdealVelocity}`)
          const [nextIdealValue, nextIdealVelocity] = stepper(
            msPerFrame / 1000,
            newIdealValue,
            newIdealVelocity,
            value,
            springConfig.stiffness,
            springConfig.damping,
            springConfig.precision
          )

          this.currentValues[key] =
            newIdealValue +
            (nextIdealValue - newIdealValue) * currentFrameCompletion
          this.currentVelocities[key] =
            newIdealVelocity +
            (nextIdealVelocity - newIdealVelocity) * currentFrameCompletion
          this.idealValues[key] = newIdealValue
          this.idealVelocities[key] = newIdealVelocity
        }

        console.log(framesToCatchUp)
        console.log(this.currentValues.value)
        console.log(this.accumulatedTime)

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

function shouldStopAnimation (currentValues, values, currentVelocities) {
  for (const key in values) {
    if (!Object.prototype.hasOwnProperty.call(values, key)) continue

    if (currentVelocities[key] !== 0) return false

    // stepper will have already taken care of rounding precision errors, so
    // won't have such thing as 0.9999 !=== 1
    if (currentValues[key] !== values[key]) return false
  }

  return true
}
