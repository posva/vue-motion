<template>
  <div class="tabs">
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: ['value'],

  methods: {
    select (value) {
      this.$emit('input', value)
    },
  },
}
</script>

<style>
.tabs {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}
</style>
