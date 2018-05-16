# Vue Motion

> Natural animations in Vue

Vue Motion uses springs to generate smooth and natural transition between
numerical values. This allows you to create smooth animations that feels natural
and that automatically adapt to its target value. These kind of _animations_ can
help with **fluid** interfaces.

## Why do I need this?

You may think you got covered by using Vue `transition` with CSS transitions, there's one big problem about CSS transition, and more specifically about using easing functions: interrupting a transition in the middle to play a different one makes the animation look floppy and unnatural. This is is because every easing requires you to define **how long a transition** takes. **Vue Motion doesn't**, let the transition takes the time it needs but control how it should behave!

## Installation

You can install Vue Motion as any other plugin:

### Bundlers

```js
import Vue from 'vue'
import VueMotion from 'vue-motion'

Vue.use(VueMotion)
```

### Browsers

```html
<!-- Vue Motion auto installs when included after Vue -->
<script src="https://unpkg.com/vue-motion"></script>
```

This will give you global access to all components.

### Local import

If you don't want to globally install the components, you can import them locally,
and even give them different names:

```js
import { Motion } from 'vue-motion'

export default {
  components: { MyMotion: Motion },
}
```

## Components

### Motion

`Motion` is the main component that allows you to transition a single value or a
group of values. You simply give it a value and it will give you access to the
transitioning value in a scoped slot.


#### Examples

##### Single Value

When transitioning a single value, pass it down with the `value` prop. You then
get access to the transitioning value in the scope with that same key: `value`.

```html
<Motion :value="offset" tag="div">
  <div slot-scope="props" :style="{ transform: `translateX(${props.value}px)` }"></div>
</Motion>
```

Then just set the value as you would normally do. `Motion` will take care of the
rest 🙂:

```js
// in the component
this.offset = 200
```

##### Multiple values

When transitioning a group of values, pass down an object or array (will be
converted to an object) to the `values` prop (with an _s_). You'll get access to
the transitioning values in the scope with the original keys.

```html
<Motion :values="size">
  <div slot-scope="_size" :style="{ width: _size.width, height: _size.height }"></div>
</Motion>
```

You can nest objects and arrays:

```js
// Given an array of sizes:
data () {
  return {
    sizes: [
      { width: 100, height: 200 },
      { width: 200, height: 70 },
      { width: 120, height: 170 },
    ]
  }
}
```

Same usage 😉

```html
<Motion :values="sizes">
  <div v-for="size in _sizes" slot-scope="_sizes" :style="{ width: size.width, height: size.height }"></div>
</Motion>
```


#### Props

|Name|Type|Required|Default|Comments|
|----|----|--------|-------|--------|
|`value`|`Number`|only when `values` is not provided||Actual value to transition after|
|`values`|`Object` or `Array`|only when `value` is not provided||It contains multiple values to transition after|
|`tag`|`String`|No|`span`|Allows you to define the container element's tag|
|`spring`|`Object` or `String`|No|`noWobble`|Defines how the transition behaves. Default to a non-wobbly spring that is used in the examples. Check the _Playground_ in the <a href="#/">Demo</a> |

When setting the `spring` on a motion, you can use any of the predefined [springs](#springs).

#### Events

- `motion-start`: Emitted when a new transition starts (basically when the value
  changes and there was no transition occurring)
- `motion-end`: Emitted when a transition finishes
- `motion-restart`: Emitted when a transition restart. This may happen when the
  animations takes too long to complete (slow frame) or when the user switches
  to another tab and comes back after a while.

## Springs

Internally, Vue Motion uses springs to transition values. A spring is defined by
its `stiffness` and its `damping`. Additionally, it's also takes a `precision`
value, used for calculations. These are the predefined springs:

|Name|Stiffness|Damping|
|----|---------|-------|
|noWobble|170|26|
|gentle|120|14|
|wobbly|180|12|
|stiff|210 |20|

The easiest way to find the kind of animation you want, is to play around with
values. Use the _Playground_ in the <a href="#/">Demo</a> for that.

<p class="warning">
All springs have a `0.01` precision which is enough for animations to look good.
</p>

## Version

You can accesse the current version of the package with

```js
import { version } from 'vue-motion'
```
