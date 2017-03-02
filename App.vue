<template>
  <div>
    <Motion :value="value">
      <template scope="props">
        <span>Value is</span>
        <pre>{{ props }}</pre>
      </template>
    </Motion>

    <input v-model.number="value" step="10" type="number" />
  </div>
</template>

<script>
import Motion from './Motion.vue'
import spring from './spring'
import stepper from './stepper'
const msPerFrame = 1000 / 60

window.stepper = stepper
window.spring = spring
window.msPerFrame = msPerFrame

export default {
  data () {
    return {
      value: 0
    }
  },

  components: { Motion }
}
</script>
