<template>
  <div class="tabs__tab"
       @click="select"
       :class="classes"
       role="button"
       @keyup.enter.space="select"
       tabindex="0"
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: ['index'],

  computed: {
    classes () {
      return {
        'tabs__tab--active': this.$parent.value === this.index,
      }
    },
  },

  methods: {
    select () {
      this.$parent.select(this.index)
    },
  },
}
</script>

<style>
.tabs__tab {
  border: solid 1px #555;
  color: #333;
  padding: .5rem;
  margin: 0 .3rem;
  border-radius: 0.3rem;
  background-color: #ddd;
  user-select: none;
  font-size: 1rem;
}

.tabs__tab:not(.tabs__tab--active):hover {
  background-color: #eee;
  cursor: pointer;
}

.tabs__tab--active {
  color: #eee;
  background-color: #35495e;
}
</style>
