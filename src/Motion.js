import stepper from './stepper'
import presets from './presets'
import { raf, now, isArray, isObject } from './utils'

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
    values: [Object, Array],
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
      return typeof this.spring === 'string' ? presets[this.spring] : this.spring
    },
    realValues () {
      return this.value != null ? { value: this.value } : this.values
    },
  },

  render (h) {
    return h(this.tag, [this.$scopedSlots.default(this.currentValues)])
  },

  watch: {
    realValues (current, old) {
      if (old !== current && !this.wasAnimating) {
        this.prevTime = now()
        this.accumulatedTime = 0
        this.animate()
      }
    },
  },

  created () {
    const current = this.defineInitialValues(this.realValues, null)

    this.currentValues = current.values
    this.currentVelocities = current.velocities
  },

  mounted () {
    this.prevTime = now()
    this.accumulatedTime = 0

    const ideal = this.defineInitialValues(this.currentValues, this.currentVelocities)

    this.idealValues = ideal.values
    this.idealVelocities = ideal.velocities

    this.animate()
  },

  methods: {
    defineInitialValues (values, velocities) {
      const newValues = {}
      const newVelocities = {}

      this.defineValues(values, velocities, newValues, newVelocities)

      return { values: newValues, velocities: newVelocities }
    },

    defineValues (values, velocities, newValues, newVelocities) {
      for (const key in values) {
        // istanbul ignore if
        if (!Object.prototype.hasOwnProperty.call(values, key)) continue

        if (isArray(values[key]) || isObject(values[key])) {
          newValues[key] = {}
          newVelocities[key] = {}

          this.defineValues(
            values[key],
            velocities && velocities[key],
            newValues[key],
            newVelocities[key]
          )

          continue
        }

        newValues[key] = values[key]
        newVelocities[key] = velocities ? velocities[key] : 0
      }
    },

    animate () {
      this.animationId = raf(() => {
        if (shouldStopAnimation(this.currentValues, this.realValues, this.currentVelocities)) {
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
          (this.accumulatedTime - Math.floor(this.accumulatedTime / msPerFrame) * msPerFrame) /
          msPerFrame
        const framesToCatchUp = Math.floor(this.accumulatedTime / msPerFrame)
        const springConfig = this.springConfig

        this.animateValues({
          framesToCatchUp,
          currentFrameCompletion,
          springConfig,
          realValues: this.realValues,
          currentValues: this.currentValues,
          currentVelocities: this.currentVelocities,
          idealValues: this.idealValues,
          idealVelocities: this.idealVelocities,
        })

        // out of the update loop
        this.animationID = null
        // the amount we're looped over above
        this.accumulatedTime -= framesToCatchUp * msPerFrame

        // keep going!
        this.animate()
      })
    },

    animateValues ({
      framesToCatchUp,
      currentFrameCompletion,
      springConfig,
      realValues,
      currentValues,
      currentVelocities,
      idealValues,
      idealVelocities,
    }) {
      for (const key in realValues) {
        // istanbul ignore if
        if (!Object.prototype.hasOwnProperty.call(realValues, key)) continue

        if (isArray(realValues[key]) || isObject(realValues[key])) {
          // the value may have been added
          if (!idealValues[key]) {
            const ideal = this.defineInitialValues(this.realValues[key], null)
            const current = this.defineInitialValues(this.realValues[key], null)
            this.$set(idealValues, key, ideal.values)
            this.$set(idealVelocities, key, ideal.velocities)
            this.$set(currentValues, key, current.values)
            this.$set(currentVelocities, key, current.velocities)
          }

          this.animateValues({
            framesToCatchUp,
            currentFrameCompletion,
            springConfig,
            realValues: realValues[key],
            currentValues: currentValues[key],
            currentVelocities: currentVelocities[key],
            idealValues: idealValues[key],
            idealVelocities: idealVelocities[key],
          })

          // nothing to animate
          continue
        }

        let newIdealValue = idealValues[key]
        let newIdealVelocity = idealVelocities[key]
        const value = realValues[key]

        // iterate as if the animation took place
        for (let i = 0; i < framesToCatchUp; i++) {
          [newIdealValue, newIdealVelocity] = stepper(
            msPerFrame / 1000,
            newIdealValue,
            newIdealVelocity,
            value,
            springConfig.stiffness,
            springConfig.damping,
            springConfig.precision
          )
        }

        const [nextIdealValue, nextIdealVelocity] = stepper(
          msPerFrame / 1000,
          newIdealValue,
          newIdealVelocity,
          value,
          springConfig.stiffness,
          springConfig.damping,
          springConfig.precision
        )

        currentValues[key] =
          newIdealValue + (nextIdealValue - newIdealValue) * currentFrameCompletion
        currentVelocities[key] =
          newIdealVelocity + (nextIdealVelocity - newIdealVelocity) * currentFrameCompletion
        idealValues[key] = newIdealValue
        idealVelocities[key] = newIdealVelocity
      }
    },
  },
}

function shouldStopAnimation (currentValues, values, currentVelocities) {
  for (const key in values) {
    // istanbul ignore if
    if (!Object.prototype.hasOwnProperty.call(values, key)) continue

    if (isArray(values[key]) || isObject(values[key])) {
      if (!shouldStopAnimation(currentValues[key], values[key], currentVelocities[key])) {
        return false
      }
      // skip the other checks
      continue
    }

    if (currentVelocities[key] !== 0) return false

    // stepper will have already taken care of rounding precision errors, so
    // won't have such thing as 0.9999 !=== 1
    if (currentValues[key] !== values[key]) return false
  }

  return true
}
