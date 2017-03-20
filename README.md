# VueMotion

[![Build Status](https://img.shields.io/circleci/project/posva/vue-motion.svg)](https://circleci.com/gh/posva/vue-motion) [![codecov](https://codecov.io/gh/posva/vue-motion/branch/master/graph/badge.svg)](https://codecov.io/gh/posva/vue-motion) [![npm](https://img.shields.io/npm/v/vue-motion.svg)](https://www.npmjs.com/package/vue-motion) [![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/) ![size](http://img.badgesize.io/posva/vue-motion/master/dist/vue-motion.min.js.svg?compression=gzip&nocache)


> Easy and natural state transitions

## Installation

```bash
npm install --save vue-motion
```

## Usage

### Bundler (Webpack, Rollup)

```js
import Vue from 'vue'
import VueMotion from 'vue-motion'
// You need a specific loader for CSS files like https://github.com/webpack/css-loader
import 'vue-motion/dist/vue-motion.css'

Vue.use(VueMotion)
```

### Browser

```html
<!-- Include after Vue -->
<!-- Local files -->
<link rel="stylesheet" href="vue-motion/dist/vue-motion.css"></link>
<script src="vue-motion/dist/vue-motion.js"></script>

<!-- From CDN -->
<link rel="stylesheet" href="https://unpkg.com/vue-motion/dist/vue-motion.css"></link>
<script src="https://unpkg.com/vue-motion"></script>
```

### Components

#### Motion

Motion allows you to transition a single value or a group of values:

```vue
<template>
  <Motion :value="x">
    <template scope="values">
      <div class="container">
        <div class="box"
             :style="{transform: `translate3d(${values.default}px, 0, 0)`}"
        ></div>
      </div>
    </template>
  </Motion>
</template>

<script>
export default {
  data () {
    return {
      x: 0,
    }
  },
  
  created () {
    // Make the block move at creation
    this.x = 400
  },
}
</script>
```

##### Events

- `motion-start`: Emitted when a given value change and a new motion starts
- `motion-end`: Emitted when a motion ends

## Development

### Launch visual tests

```bash
npm run dev
```

### Launch Karma with coverage

```bash
npm run dev:coverage
```

### Build

Bundle the js and css of to the `dist` folder:

```bash
npm run build
```


## Publishing

The `prepublish` hook will ensure dist files are created before publishing. This
way you don't need to commit them in your repository.

```bash
# Bump the version first
# It'll also commit it and create a tag
npm version
# Push the bumped package and tags
git push --follow-tags
# Ship it 🚀
npm publish
```

## License

[MIT](http://opensource.org/licenses/MIT)
