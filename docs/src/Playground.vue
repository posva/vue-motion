<template>
  <div>
    <Motion
        :value="n"
        :spring="config"
        @motion-start="start"
        @motion-end="end"
        @motion-restart="restart"
    >
      <template scope="values">
        <span>Value is</span>
        <pre>{{ values }}</pre>
        <div class="demo-container">
          <div
              class="demo"
              :style="{transform: `translate3d(${values.value}px, 0, 0)`}"
          ></div>
        </div>
      </template>
    </Motion>

    <input v-model.number="n" step="10" type="number" />
    <br/>
    <button @click="toggle">Toggle</button>
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
    <br/>
    <button v-for="(preset, name) in presets" @click="setSpring(preset)">{{ name }}</button>
  </div>
</template>

<script>
import Motion from '../../src/Motion'
import presets from '../../src/presets'

export default {
  data () {
    return {
      n: 0,
      max: 200,
      config: {
        stiffness: 170,
        damping: 26,
        precision: 0.01,
      },
    }
  },

  computed: {
    presets () {
      return presets
    },
    logoSize () {
      return {
        width: this.logoWidth,
        height: this.logoHeight,
      }
    },
  },

  methods: {
    toggle () {
      this.n = this.n < this.max / 2
        ? this.max
        : 0
    },
    setSpring (config) {
      this.config = config
      this.config.precision = this.config.precision || 0.01
    },
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
    restart () {
      console.log('Restart')
    },
  },

  components: { Motion },
}
</script>

<style scoped>
.demo {
  width: 100px;
  height: 100px;
  background-color: crimson;
}

.demo-container {
  width: 300px;
  background-color: lightgray;
}
</style>
