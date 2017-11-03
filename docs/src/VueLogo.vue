<template>
  <Motion
      tag="div"
      :values="values"
      :spring="spring"
      @motion-end="end"
  >
    <template scope="props">
      <div class="logo" :style="style(props.x)">
        <VueSvg
            :width="256"
            :height="221"
            :x="props.x"
            :rotated="props.rotated"
            @touchstart.native="animate"
        />
      </div>
    </template>
  </Motion>
</template>

<script>
import Motion from '../../src/Motion'
import VueSvg from './VueSvg'

export default {
  data () {
    return {
      x: -1000,
      rotated: 0,
    }
  },

  mounted () {
    setTimeout(() => {
      this.x = 0
    }, 1000)
  },

  methods: {
    end () {
      this.timer = setTimeout(() => {
        this.timer = null
        this.rotated = this.rotated === 0
          ? 180
          : 0
      }, 10000)
    },

    animate () {
      if (this.timer) clearTimeout(this.timer)
      this.rotated += 360
    },
    style (x) {
      return {
        overflow: Math.abs(x) > 10
          ? 'hidden'
          : 'initial',
      }
    },
  },

  computed: {
    spring () {
      return {
        stiffness: 180,
        damping: 12,
        precision: 0.01,
      }
    },
    values () {
      return {
        x: this.x,
        rotated: this.rotated,
      }
    },
  },

  components: { Motion, VueSvg },
}
</script>

<style scoped>
.logo {
  border: 2px solid lightgrey;
  background-color: white;
  border-radius: 1rem;
  padding: 1.2rem 0;
  max-width: 100%;
  width: 480px;
  margin: auto;
}
.logo svg {
  display: block;
  margin: auto;
}
</style>
