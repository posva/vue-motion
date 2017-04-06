<template>
  <div>
    <button @click="previous">Previous</button>
    <input type="range" v-model="current" min="0" :max="photos.length - 1"/>
    <button @click="next">Next</button>
    <div class="demo">
      <Motion :values="sizesNormalized"
              tag="div"
              class="demo-inner"
      >
        <template scope="resizes">
          <PhotosContainer
              class="container"
              :sizes="sizes"
              :current="current"
              :style="{ width: `${resizes.width}px`, height: `${resizes.height}px` }"
          >
            <template scope="pcProps">
              <div class="photos"
                   :style="{ left: `${pcProps.left}px` }"
              >
                <img v-for="(photo, i) in photos"
                     class="photo"
                     @touchstart="next"
                     :style="{ width: `${resizes['w' + i]}px`, height: `${resizes['h' + i]}px` }"
                     :src="photo.src"/>
              </div>
            </template>
          </PhotosContainer>
        </template>
      </Motion>
    </div>
  </div>
</template>

<script>
import Motion from '../../src/Motion'
import PhotosContainer from './PhotosContainer'

export default {
  data () {
    return {
      current: 0,
    }
  },

  computed: {
    sizes () {
      const current = this.photos[this.current]
      return this.photos.map(photo => ({
        width: photo.width * (current.height / photo.height),
        height: current.height,
      }))
    },
    sizesNormalized () {
      return this.sizes.reduce((res, size, i) => {
        res[`w${i}`] = size.width
        res[`h${i}`] = size.height
        return res
      }, {
        width: this.photos[this.current].width,
        height: this.photos[this.current].height,
      })
    },
    photos () {
      return [
        {
          width: 300,
          height: 450,
          src: require('./img/cat1.jpg'),
        },
        {
          width: 500,
          height: 390,
          src: require('./img/cat2.jpg'),
        },
        {
          width: 500,
          height: 330,
          src: require('./img/cat3.jpg'),
        },
        {
          width: 491,
          height: 251,
          src: require('./img/cat4.jpg'),
        },
        {
          width: 447,
          height: 500,
          src: require('./img/cat5.jpg'),
        },
        {
          width: 320,
          height: 154,
          src: 'https://media.giphy.com/media/JEVqknUonZJWU/giphy.gif',
        },
      ]
    },
  },

  methods: {
    next () {
      if (++this.current >= this.photos.length) {
        this.current = 0
      }
    },
    previous () {
      if (--this.current < 0) {
        this.current = this.photos.length - 1
      }
    },
    leftSpace (sizes) {
      const lefts = Array(this.photos.length)

      let cumulated = 0
      for (let i = this.current; i < this.photos.length; ++i) {
        lefts[i] = cumulated
        cumulated += sizes[`w${i}`]
      }

      if (this.current > 0) {
        cumulated = 0
        for (let i = this.current - 1; i >= 0; --i) {
          cumulated -= sizes[`w${i}`]
          lefts[i] = cumulated
        }
      }
      return lefts
    },
  },

  components: { Motion, PhotosContainer },
}
</script>

<style scoped>
.demo {
  display: flex;
  align-items: center;
  height: 600px;
}

.demo-inner {
  width: 100%;
}

.container {
  position: relative;
  overflow: hidden;
  margin: auto;
  max-width: 100%;
}

.photos {
  position: absolute;
  white-space: nowrap;
}
</style>
