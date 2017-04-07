/*!
 * vue-motion v0.1.4
 * (c) 2017 Eduardo San Martin Morote
 * Released under the MIT License.
 */

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
  noWobble: { stiffness: 170, damping: 26, precision: 0.01 }, // the default, if nothing provided
  gentle: { stiffness: 120, damping: 14, precision: 0.01 },
  wobbly: { stiffness: 180, damping: 12, precision: 0.01 },
  stiff: { stiffness: 210, damping: 20, precision: 0.01 },
};

var raf = window.requestAnimationFrame.bind(window);
var now = performance.now.bind(performance);

var msPerFrame = 1000 / 60;

var Motion = {
  data: function data () {
    return {
      currentValues: null,
      currentVelocities: null,
    }
  },

  props: {
    value: Number,
    values: [Object, Array],
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
    realValues: function realValues () {
      return this.value != null
        ? { value: this.value }
        : this.values
    },
  },

  render: function render (h) {
    return h(this.tag, [
      this.$scopedSlots.default(this.currentValues) ])
  },

  watch: {
    realValues: function realValues (current, old) {
      if (old !== current && !this.wasAnimating) {
        this.prevTime = now();
        this.accumulatedTime = 0;
        this.animate();
      }
    },
  },

  created: function created () {
    var this$1 = this;

    var values = {};
    var velocities = {};
    for (var key in this$1.realValues) {
      // istanbul ignore if
      if (!Object.prototype.hasOwnProperty.call(this$1.realValues, key)) { continue }
      values[key] = this$1.realValues[key];
      velocities[key] = 0;
    }
    this.currentValues = values;
    this.currentVelocities = velocities;
  },

  mounted: function mounted () {
    this.prevTime = now();
    this.accumulatedTime = 0;
    this.idealValues = Object.assign({}, this.currentValues);
    this.idealVelocities = Object.assign({}, this.currentVelocities);
    this.animate();
  },

  methods: {
    animate: function animate () {
      var this$1 = this;

      this.animationId = raf(function () {
        if (shouldStopAnimation(
          this$1.currentValues,
          this$1.realValues,
          this$1.currentVelocities
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

        for (var key in this$1.realValues) {
          // istanbul ignore if
          if (!Object.prototype.hasOwnProperty.call(this$1.realValues, key)) { continue }
          var newIdealValue = this$1.idealValues[key];
          var newIdealVelocity = this$1.idealVelocities[key];
          var value = this$1.realValues[key];
          var springConfig = this$1.springConfig;

          // iterate as if the animation took place
          for (var i = 0; i < framesToCatchUp; i++) {
            var assign;
            (assign = stepper(
              msPerFrame / 1000,
              newIdealValue,
              newIdealVelocity,
              value,
              springConfig.stiffness,
              springConfig.damping,
              springConfig.precision
            ), newIdealValue = assign[0], newIdealVelocity = assign[1]);
          }

          var ref = stepper(
            msPerFrame / 1000,
            newIdealValue,
            newIdealVelocity,
            value,
            springConfig.stiffness,
            springConfig.damping,
            springConfig.precision
          );
          var nextIdealValue = ref[0];
          var nextIdealVelocity = ref[1];

          this$1.currentValues[key] =
            newIdealValue +
            (nextIdealValue - newIdealValue) * currentFrameCompletion;
          this$1.currentVelocities[key] =
            newIdealVelocity +
            (nextIdealVelocity - newIdealVelocity) * currentFrameCompletion;
          this$1.idealValues[key] = newIdealValue;
          this$1.idealVelocities[key] = newIdealVelocity;
        }

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

function shouldStopAnimation (currentValues, values, currentVelocities) {
  for (var key in values) {
    // istanbul ignore if
    if (!Object.prototype.hasOwnProperty.call(values, key)) { continue }

    if (currentVelocities[key] !== 0) { return false }

    // stepper will have already taken care of rounding precision errors, so
    // won't have such thing as 0.9999 !=== 1
    if (currentValues[key] !== values[key]) { return false }
  }

  return true
}

function plugin (Vue) {
  Vue.component('Motion', Motion);
}

// Install by default if using the script tag
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin);
}

var version = '0.1.4';

export { Motion, version };export default plugin;
