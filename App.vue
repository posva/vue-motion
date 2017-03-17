<template>
  <div>
    <Motion :value="n"
            :spring="config"
            @motion-start="start"
            @motion-end="end"
    >
      <template scope="values">
        <span>Value is</span>
        <pre>{{ values }}</pre>
        <div style="width: 100%">
          <input disabled style="width: 100%" min="-30" :max="30 + max" type="range" :value="values.value"/>
        </div>
      </template>
    </Motion>

    <input v-model.number="n" step="10" type="number" />
    <br/>
    <label>
      Stiffness
      <input v-model.number="config.stiffness" step="10" type="number"/>
    </label>
    <br/>
    <label>
      Damping
      <input v-model.number="config.damping" step="1" type="number"/>
    </label>
    <br/>
    <label>
      Precision
      <input v-model.number="config.precision" step="0.01" type="number"/>
    </label>
  </div>
</template>

<script>
import Motion from './Motion.vue'

export default {
  data () {
    return {
      n: 0,
      max: 400,
      config: {
        stiffness: 170,
        damping: 26,
        precision: 0.01,
      },
    }
  },

  created () {
    setInterval(() => {
      this.n = this.n < this.max / 2
             ? this.max
             : 0
    }, 2000)
  },

  methods: {
    start () {
      console.log('---------')
      console.log('Start')
      console.time('motion')
    },
    end () {
      console.log('Stop')
      console.timeEnd('motion')
      console.log('---------')
    },
  },

  components: { Motion }
}
</script>
