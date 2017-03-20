/*!
 * vue-motion v0.1.1
 * (c) 2017 Eduardo San Martin Morote
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global['vue-motion'] = global['vue-motion'] || {})));
}(this, (function (exports) { 'use strict';

/* @flow */

// stepper is used a lot. Saves allocation to return the same array wrapper.
// This is fine and danger-free against mutations because the callsite
// immediately destructures it and gets the numbers inside without passing the
// array reference around.
var reusedTuple = [0, 0];
function stepper (
  secondPerFrame,
  x,
  v,
  destX,
  k,
  b,
  precision
) {
  // Spring stiffness, in kg / s^2

  // for animations, destX is really spring length (spring at rest). initial
  // position is considered as the stretched/compressed position of a spring
  var Fspring = -k * (x - destX);

  // Damping, in kg / s
  var Fdamper = -b * v;

  // usually we put mass here, but for animation purposes, specifying mass is a
  // bit redundant. you could simply adjust k and b accordingly
  // let a = (Fspring + Fdamper) / mass
  var a = Fspring + Fdamper;

  var newV = v + a * secondPerFrame;
  var newX = x + newV * secondPerFrame;

  if (Math.abs(newV) < precision && Math.abs(newX - destX) < precision) {
    reusedTuple[0] = destX;
    reusedTuple[1] = 0;
    return reusedTuple
  }

  reusedTuple[0] = newX;
  reusedTuple[1] = newV;
  return reusedTuple
}

/* @flow */
var presets = {
  noWobble: { stiffness: 170, damping: 26 }, // the default, if nothing provided
  gentle: { stiffness: 120, damping: 14 },
  wobbly: { stiffness: 180, damping: 12 },
  stiff: { stiffness: 210, damping: 20 },
};

var raf = window.requestAnimationFrame.bind(window);
var now = performance.now.bind(performance);

var msPerFrame = 1000 / 60;

var Motion = {
  data: function data () {
    return {
      currentValue: 0,
      currentVelocity: 0,
    }
  },

  props: {
    value: {
      type: Number,
    },
    tag: {
      type: String,
      default: 'span',
    },
    spring: {
      type: [Object, String],
      default: 'noWobble',
    },
  },

  computed: {
    springConfig: function springConfig () {
      return typeof this.spring === 'string'
        ? presets[this.spring]
        : this.spring
    },
  },

  render: function render (h) {
    return h(this.tag, [
      this.$scopedSlots.default({
        value: this.currentValue,
      }) ])
  },

  watch: {
    value: function value (old, current) {
      if (old !== current && !this.wasAnimating) {
        this.prevTime = now();
        this.accumulatedTime = 0;
        this.animate();
      }
    },
  },

  mounted: function mounted () {
    this.currentValue = this.value;
    this.prevTime = now();
    this.accumulatedTime = 0;
    this.idealValue = this.currentValue;
    this.idealVelocity = this.currentVelocity;
    this.animate();
  },

  methods: {
    animate: function animate () {
      var this$1 = this;

      this.animationId = raf(function () {
        if (shouldStopAnimation(
          this$1.currentValue,
          this$1.value,
          this$1.currentVelocity
        )) {
          if (this$1.wasAnimating) { this$1.$emit('motion-end'); }

          // reset everything for next animation
          this$1.animationId = null;
          this$1.wasAnimating = false;
          return
        }

        if (!this$1.wasAnimating) { this$1.$emit('motion-start'); }
        this$1.wasAnimating = true;

        // get time from last frame
        var currentTime = now();
        var timeDelta = currentTime - this$1.prevTime;
        this$1.prevTime = currentTime;
        this$1.accumulatedTime += timeDelta;

        // more than 10 frames? prolly switched browser tab. Restart
        if (this$1.accumulatedTime > msPerFrame * 10) {
          this$1.accumulatedTime = 0;
        }

        if (this$1.accumulatedTime === 0) {
          // no need to cancel animationID here; shouldn't have any in flight
          this$1.animationID = null;
          this$1.$emit('motion-restart');
          this$1.animate();
          return
        }

        var currentFrameCompletion =
          (this$1.accumulatedTime - Math.floor(this$1.accumulatedTime / msPerFrame) * msPerFrame) / msPerFrame;
        var framesToCatchUp = Math.floor(this$1.accumulatedTime / msPerFrame);

        var newIdealValue = this$1.idealValue;
        var newIdealVelocity = this$1.idealVelocity;

        // iterate as if the animation took place
        for (var i = 0; i < framesToCatchUp; i++) {
          var assign;
          (assign = stepper(
            msPerFrame / 1000,
            newIdealValue,
            newIdealVelocity,
            this$1.value,
            this$1.springConfig.stiffness,
            this$1.springConfig.damping,
            this$1.springConfig.precision
          ), newIdealValue = assign[0], newIdealVelocity = assign[1]);
        }

        var ref = stepper(
          msPerFrame / 1000,
          newIdealValue,
          newIdealVelocity,
          this$1.value,
          this$1.springConfig.stiffness,
          this$1.springConfig.damping,
          this$1.springConfig.precision
        );
        var nextIdealValue = ref[0];
        var nextIdealVelocity = ref[1];

        this$1.currentValue =
          newIdealValue +
          (nextIdealValue - newIdealValue) * currentFrameCompletion;
        this$1.currentVelocity =
          newIdealVelocity +
          (nextIdealVelocity - newIdealVelocity) * currentFrameCompletion;
        this$1.idealValue = newIdealValue;
        this$1.idealVelocity = newIdealVelocity;

        // out of the update loop
        this$1.animationID = null;
        // the amount we're looped over above
        this$1.accumulatedTime -= framesToCatchUp * msPerFrame;

        // keep going!
        this$1.animate();
      });
    },
  },
};

function shouldStopAnimation (currentValue, value, currentVelocity) {
  if (currentVelocity !== 0) { return false }

  // stepper will have already taken care of rounding precision errors, so
  // won't have such thing as 0.9999 !=== 1
  if (currentValue !== value) { return false }

  return true
}

function plugin (Vue) {
  Vue.component('Motion', Motion);
}

// Install by default if using the script tag
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin);
}

var version = '0.1.1';

exports['default'] = plugin;
exports.Motion = Motion;
exports.version = version;

Object.defineProperty(exports, '__esModule', { value: true });

})));
