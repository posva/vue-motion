<template>
  <div>
    <Motion :value="n"
            :spring="config"
    >
      <template scope="values">
        <div class="demo-container">
          <div class="demo"
               :style="{transform: `translate3d(${values.value}px, 0, 0)`}"
          ></div>
        </div>
      </template>
    </Motion>

    <br/>
    <button @click="toggle">Toggle</button>
  </div>
</template>

<script>
import Motion from './src/Motion.vue'

export default {
  data () {
    return {
      n: 0,
      max: 400,
      config: {
        stiffness: 170,
        damping: 26,
        precision: 0.01
      }
    }
  },

  methods: {
    toggle () {
      this.n = this.n < this.max / 2
             ? this.max
             : 0
    }
  },

  components: { Motion }
}
</script>

<style>
.demo {
  width: 100px;
  height: 100px;
  background-color: crimson;
}
.demo-container {
  margin-left: 30px;
  width: 500px;
  background-color: gray;
}
</style>
