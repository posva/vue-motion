<template>
  <svg viewBox="0 0 256 221"
       :style="style"
       xmlns="http://www.w3.org/2000/svg"
       preserveAspectRatio="xMinYMin meet">
    <path d="M0 0l128 220.8L256 0h-51.2L128 132.48 50.56 0H0z" fill="#41B883" />
    <path d="M50.56 0L128 133.12 204.8 0h-47.36L128 51.2 97.92 0H50.56z" fill="#35495E" />
  </svg>
</template>

<script>
export default {
  props: {
    width: Number,
    height: Number,
    x: Number,
    rotated: Number,
  },

  computed: {
    style () {
      return {
        width: this.width,
        height: this.height,
        transform: `perspective(200px) \
                    translateX(${this.x}px) \
                    rotateY(${this.rotated}deg)`,
      }
    },
  },
}
</script>
