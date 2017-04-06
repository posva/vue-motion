<template>
  <div id="app">
    <h1 class="title">Vue Motion</h1>
    <h2 class="subtitle">Natural animations for Vue</h2>

    <VueLogo/>


    <section>
      <Tabs v-model="currentTab">
        <Tab :index="0">Playground</Tab>
        <Tab :index="1">Gallery Example</Tab>
      </Tabs>

      <Motion tag="div" class="main" :values="tabsPositions">
        <template scope="tabs">
          <Playground class="content"
                      :style="{ transform: `translateX(${tabs.first}px)` }"
                      ref="first"/>
          <Gallery class="content"
                   :style="{ transform: `translateX(${tabs.second}px)` }"
                   ref="second"/>
        </template>
      </Motion>

    </section>
  </div>
</template>

<script>
import Motion from '../../src/Motion'
import VueLogo from './VueLogo'
import Tab from './Tab'
import Tabs from './Tabs'
import Playground from './Playground'
import Gallery from './Gallery'

export default {
  data () {
    return {
      currentTab: -1,
    }
  },

  mounted () {
    this.currentTab = 1
  },

  computed: {
    tabsPositions () {
      this.currentTab
      if (!this.$el) {
        return {
          first: 0,
          second: 0,
        }
      }
      const first = this.$refs.first
      const second = this.$refs.second
      return {
        first: this.currentTab * -first.$el.offsetWidth,
        second: (-this.currentTab + 1) * second.$el.offsetWidth,
      }
    },
  },

  components: { Motion, VueLogo, Tabs, Tab, Playground, Gallery },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Lato');

* {
  box-sizing: border-box;
  font-family: 'Lato', 'helvetica neue', sans-serif;
}

body {
  background-color: ghostwhite;
  margin: 0;
}

#app {
  padding: 20px;
}

.title {
  font-size: 48px;
  margin: 1rem 0;
  text-align: center;
}

.subtitle {
  font-size: 1.1rem;
  text-align: center;
  color: gray;
}

.main {
  position: relative;
  width: 100%;
  height: 656px;
}

.content {
  position: absolute;
  background-color: white;
  left: 0;
  right: 0;
  width: 100%;
  border: 1px solid #e5e5e5;
  padding: 1rem;
  border-radius: .5rem;
  display: inline-block;
}
</style>
