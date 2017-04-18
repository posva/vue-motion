import MotionInjector from 'inject-loader!src/Motion'
import presets from 'src/presets'
import {
  createVM,
  nextTick,
} from '../helpers'

const msPerFrame = 1000 / 60

let Motion

describe('Motion', function () {
  beforeEach(function () {
    let now = 0
    const queue = []
    this.raf = sinon.spy(cb => {
      queue.push(cb)
    })
    this.step = function step (n = 1) {
      for (let i = 0; i < n; ++i) {
        if (!queue.length) return
        queue.shift()()
      }
    }
    this.stepUntil = function step (fn, maxCount = 5000) {
      let count = 0
      while (queue.length && !fn() && count++ < maxCount) {
        queue.shift()()
      }
      if (count >= maxCount) throw new Error('Too many calls')
    }
    this.timeSlowdown = 1
    this.now = sinon.spy(() => now += this.timeSlowdown * msPerFrame) // eslint-disable-line no-return-assign
    Motion = MotionInjector({
      './utils': {
        raf: this.raf,
        now: this.now,
      },
    }).default
  })

  it('works with perfect time', function (done) {
    const vm = createVM(this, `
<Motion :value="n" :spring="config">
  <template scope="values">
    <pre>{{ values.value }}</pre>
  </template>
</Motion>
`, {
  data: {
    n: 0,
    config: {
      stiffness: 170,
      damping: 26,
      precision: 0.01,
    },
  },
  components: { Motion },
})
    vm.$('pre').should.have.text('0')
    vm.n = 10
    nextTick().then(() => {
      this.step()
    }).then(() => {
      vm.$('pre').should.have.text('0.4722222222222221')
      this.step()
    }).then(() => {
      vm.$('pre').should.have.text('1.1897376543209877')
      this.stepUntil(() => vm.$('pre').text === '10')
    }).then(done)
  })

  it('works with imperfect time', function (done) {
    this.timeSlowdown = 11
    const vm = createVM(this, `
<Motion :value="n" :spring="config">
  <template scope="values">
    <pre>{{ values.value }}</pre>
  </template>
</Motion>
`, {
  data: {
    n: 0,
    config: {
      stiffness: 170,
      damping: 26,
      precision: 0.01,
    },
  },
  components: { Motion },
})
    vm.$('pre').should.have.text('0')
    vm.n = 10
    nextTick().then(() => {
      this.step()
    }).then(() => {
      vm.$('pre').should.have.text('0')
      this.timeSlowdown = 0.01
      this.step()
    }).then(() => {
      vm.$('pre').should.have.text('0.0047222222222211485')
      this.step()
    }).then(() => {
      vm.$('pre').should.have.text('0.009444444444442297')
    }).then(done)
  })

  it('accepts a string as the spring', function (done) {
    const vm = createVM(this, `
<Motion ref="motion" :value="n" :spring="spring">
  <template scope="values">
    <pre>{{ values.value }}</pre>
  </template>
</Motion>
`, {
  data: {
    n: 0,
    spring: 'noWobble',
  },
  components: { Motion },
})
    vm.$refs.motion.springConfig.should.eql(presets.noWobble)
    vm.spring = 'gentle'
    nextTick().then(() => {
      vm.$refs.motion.springConfig.should.eql(presets.gentle)
    }).then(done)
  })

  it('can define custom presets for springs', function (done) {
    presets.custom = {
      stiffness: 10,
      damping: 20,
      precision: 0.03,
    }

    const vm = createVM(this, `
<Motion ref="motion" :value="n" :spring="spring">
  <template scope="values">
    <pre>{{ values.value }}</pre>
  </template>
</Motion>
`, {
  data: {
    n: 0,
    spring: 'noWobble',
  },
  components: { Motion },
})
    vm.$refs.motion.springConfig.should.eql(presets.noWobble)
    vm.spring = 'custom'
    nextTick().then(() => {
      vm.$refs.motion.springConfig.should.eql(presets.custom)

      delete presets.custom
    }).then(done)
  })

  it('uses noWobble by default as the spring', function () {
    const vm = createVM(this, `
<Motion ref="motion" :value="n">
  <template scope="values">
    <pre>{{ values.value }}</pre>
  </template>
</Motion>
`, {
  data: { n: 0 },
  components: { Motion },
})
    vm.$refs.motion.springConfig.should.eql(presets.noWobble)
  })

  it('supports object syntax', function (done) {
    const vm = createVM(this, `
<Motion :values="values" :spring="config">
  <template scope="values">
    <span class="a">{{ values.a }}</span>
    <span class="b">{{ values.b }}</span>
  </template>
</Motion>
`, {
  data: {
    values: {
      a: 0,
      b: -10,
    },
    config: {
      stiffness: 170,
      damping: 26,
      precision: 0.01,
    },
  },
  components: { Motion },
})
    vm.$('.a').should.have.text('0')
    vm.values.a = 10
    nextTick().then(() => {
      this.step()
      vm.values.b = 0
    }).then(() => {
      vm.$('.a').should.have.text('0.4722222222222222')
      this.step()
    }).then(() => {
      vm.$('.a').should.have.text('1.1897376543209877')
      vm.$('.b').should.have.text('-9.527777777777779')
      this.stepUntil(() => vm.$('.a').text === '10')
    }).then(done)
  })
})
