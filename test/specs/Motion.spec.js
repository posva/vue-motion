import MotionInjector from 'inject-loader!src/Motion'
import presets from 'src/presets'
import { isArray, isObject } from 'src/utils'
import { createVM, nextTick } from '../helpers'

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
    this.now = sinon.spy(() => (now += this.timeSlowdown * msPerFrame)) // eslint-disable-line no-return-assign
    Motion = MotionInjector({
      './utils': {
        raf: this.raf,
        now: this.now,
        isArray,
        isObject,
      },
    }).default
  })

  it('works with perfect time', function (done) {
    const vm = createVM(
      this,
      `
<Motion :value="n" :spring="config">
  <template slot-scope="values">
    <pre>{{ values.value }}</pre>
  </template>
</Motion>
`,
      {
        data: {
          n: 0,
          config: {
            stiffness: 170,
            damping: 26,
            precision: 0.01,
          },
        },
        components: { Motion },
      }
    )
    vm.$('pre').should.have.text('0')
    vm.n = 10
    nextTick()
      .then(() => {
        this.step()
      })
      .then(() => {
        vm.$('pre').should.have.text('0.4722222222222221')
        this.step()
      })
      .then(() => {
        vm.$('pre').should.have.text('1.1897376543209877')
        this.stepUntil(() => vm.$('pre').text === '10')
      })
      .then(done)
  })

  it('works with imperfect time', function (done) {
    this.timeSlowdown = 11
    const vm = createVM(
      this,
      `
<Motion :value="n" :spring="config">
  <template slot-scope="values">
    <pre>{{ values.value }}</pre>
  </template>
</Motion>
`,
      {
        data: {
          n: 0,
          config: {
            stiffness: 170,
            damping: 26,
            precision: 0.01,
          },
        },
        components: { Motion },
      }
    )
    vm.$('pre').should.have.text('0')
    vm.n = 10
    nextTick()
      .then(() => {
        this.step()
      })
      .then(() => {
        vm.$('pre').should.have.text('0')
        this.timeSlowdown = 0.01
        this.step()
      })
      .then(() => {
        vm.$('pre').should.have.text('0.0047222222222211485')
        this.step()
      })
      .then(() => {
        vm.$('pre').should.have.text('0.009444444444442297')
      })
      .then(done)
  })

  it('accepts a string as the spring', function (done) {
    const vm = createVM(
      this,
      `
<Motion ref="motion" :value="n" :spring="spring">
  <template slot-scope="values">
    <pre>{{ values.value }}</pre>
  </template>
</Motion>
`,
      {
        data: {
          n: 0,
          spring: 'noWobble',
        },
        components: { Motion },
      }
    )
    vm.$refs.motion.springConfig.should.eql(presets.noWobble)
    vm.spring = 'gentle'
    nextTick()
      .then(() => {
        vm.$refs.motion.springConfig.should.eql(presets.gentle)
      })
      .then(done)
  })

  it('can define custom presets for springs', function (done) {
    presets.custom = {
      stiffness: 10,
      damping: 20,
      precision: 0.03,
    }

    const vm = createVM(
      this,
      `
<Motion ref="motion" :value="n" :spring="spring">
  <template slot-scope="values">
    <pre>{{ values.value }}</pre>
  </template>
</Motion>
`,
      {
        data: {
          n: 0,
          spring: 'noWobble',
        },
        components: { Motion },
      }
    )
    vm.$refs.motion.springConfig.should.eql(presets.noWobble)
    vm.spring = 'custom'
    nextTick()
      .then(() => {
        vm.$refs.motion.springConfig.should.eql(presets.custom)

        delete presets.custom
      })
      .then(done)
  })

  it('uses noWobble by default as the spring', function () {
    const vm = createVM(
      this,
      `
<Motion ref="motion" :value="n">
  <template slot-scope="values">
    <pre>{{ values.value }}</pre>
  </template>
</Motion>
`,
      {
        data: { n: 0 },
        components: { Motion },
      }
    )
    vm.$refs.motion.springConfig.should.eql(presets.noWobble)
  })

  it('supports array syntax', function (done) {
    const vm = createVM(
      this,
      `
<Motion :values="values" :spring="config">
  <template slot-scope="values">
    <span class="a">{{ values[0] }}</span>
    <span class="b">{{ values[1] }}</span>
  </template>
</Motion>
`,
      {
        data: {
          values: [0, -10],
          config: {
            stiffness: 170,
            damping: 26,
            precision: 0.01,
          },
        },
        components: { Motion },
      }
    )
    vm.$('.a').should.have.text('0')
    vm.values[0] = 10
    nextTick()
      .then(() => {
        this.step()
        vm.values[1] = 0
      })
      .then(() => {
        vm.$('.a').should.have.text('0.4722222222222222')
        this.step()
      })
      .then(() => {
        vm.$('.a').should.have.text('1.1897376543209877')
        vm.$('.b').should.have.text('-9.527777777777779')
        this.stepUntil(() => vm.$('.a').text === '10')
      })
      .then(done)
  })

  it('supports object syntax', function (done) {
    const vm = createVM(
      this,
      `
<Motion :values="values" :spring="config">
  <template slot-scope="values">
    <span class="a">{{ values.a }}</span>
    <span class="b">{{ values.b }}</span>
  </template>
</Motion>
`,
      {
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
      }
    )
    vm.$('.a').should.have.text('0')
    vm.values.a = 10
    nextTick()
      .then(() => {
        this.step()
        vm.values.b = 0
      })
      .then(() => {
        vm.$('.a').should.have.text('0.4722222222222222')
        this.step()
      })
      .then(() => {
        vm.$('.a').should.have.text('1.1897376543209877')
        vm.$('.b').should.have.text('-9.527777777777779')
        this.stepUntil(() => vm.$('.a').text === '10')
      })
      .then(done)
  })

  it('supports nested arrays', function (done) {
    const vm = createVM(
      this,
      `
<Motion :values="values" :spring="config">
  <template slot-scope="values">
    <span class="v00">{{ values[0][0] }}</span>
    <span class="v01">{{ values[0][1] }}</span>
    <span class="v10">{{ values[1][0] }}</span>
    <span class="v11">{{ values[1][1] }}</span>
  </template>
</Motion>
`,
      {
        data: {
          values: [[0, -10], [-10, 0]],
          config: {
            stiffness: 170,
            damping: 26,
            precision: 0.01,
          },
        },
        components: { Motion },
      }
    )
    vm.$('.v00').should.have.text('0')
    vm.values[0][0] = 10
    nextTick()
      .then(() => {
        this.step()
        vm.values[1][0] = 0
      })
      .then(() => {
        vm.$('.v00').should.have.text('0.4722222222222222')
        this.step()
      })
      .then(() => {
        vm.$('.v00').should.have.text('1.1897376543209877')
        vm.$('.v10').should.have.text('-9.527777777777779')
        this.stepUntil(() => vm.$('.v00').text === '10')
      })
      .then(done)
  })

  it.skip('supports pushing new elements to arrays', function (done) {
    const vm = createVM(
      this,
      `
<Motion :values="values">
  <div class="container" slot-scope="values">
    <span v-for="v in values">{{ v }} </span>
  </div>
</Motion>
`,
      {
        data: {
          values: [10],
        },
        components: { Motion },
      }
    )
    // vm.$('span').should.have.text('10 ')
    vm.values = [10, 20]
    nextTick()
      .then(() => {
        this.step()
      })
      .then(() => {
        vm.$('.container').should.have.text('10 20 ')
        vm.values[1] = 0
        // vm.$('.container').should.have.text('10 20')
        // this.stepUntil(() => vm.$('.container').text === '10 20 ')
      })
      .then(done)
  })

  it('supports nested objects', function (done) {
    const vm = createVM(
      this,
      `
<Motion :values="values" :spring="config">
  <template slot-scope="values">
    <span class="vaa">{{ values.a.a }}</span>
    <span class="vab">{{ values.a.b }}</span>
    <span class="vba">{{ values.b.a }}</span>
    <span class="vbb">{{ values.b.b }}</span>
  </template>
</Motion>
`,
      {
        data: {
          values: {
            a: { a: 0, b: -10 },
            b: { a: -10, b: 0 },
          },
          config: {
            stiffness: 170,
            damping: 26,
            precision: 0.01,
          },
        },
        components: { Motion },
      }
    )
    vm.$('.vaa').should.have.text('0')
    vm.values.a.a = 10
    nextTick()
      .then(() => {
        this.step()
        vm.values.b.a = 0
      })
      .then(() => {
        vm.$('.vaa').should.have.text('0.4722222222222222')
        this.step()
      })
      .then(() => {
        vm.$('.vaa').should.have.text('1.1897376543209877')
        vm.$('.vba').should.have.text('-9.527777777777779')
        this.stepUntil(() => vm.$('.vaa').text === '10')
      })
      .then(done)
  })

  it('supports nested objects in arrays', function (done) {
    const vm = createVM(
      this,
      `
<Motion :values="values" :spring="config">
  <template slot-scope="values">
    <span class="v0a">{{ values[0].a }}</span>
    <span class="v0b">{{ values[0].b }}</span>
    <span class="v1a">{{ values[1].a }}</span>
    <span class="v1b">{{ values[1].b }}</span>
  </template>
</Motion>
`,
      {
        data: {
          values: [{ a: 0, b: -10 }, { a: -10, b: 0 }],
          config: {
            stiffness: 170,
            damping: 26,
            precision: 0.01,
          },
        },
        components: { Motion },
      }
    )
    vm.$('.v0a').should.have.text('0')
    vm.values[0].a = 10
    nextTick()
      .then(() => {
        this.step()
        vm.values[1].a = 0
      })
      .then(() => {
        vm.$('.v0a').should.have.text('0.4722222222222222')
        this.step()
      })
      .then(() => {
        vm.$('.v0a').should.have.text('1.1897376543209877')
        vm.$('.v1a').should.have.text('-9.527777777777779')
        this.stepUntil(() => vm.$('.v0a').text === '10')
      })
      .then(done)
  })

  it('supports nested arrays in objects', function (done) {
    const vm = createVM(
      this,
      `
<Motion :values="values" :spring="config">
  <template slot-scope="values">
    <span class="va0">{{ values.a[0] }}</span>
    <span class="va1">{{ values.a[1] }}</span>
    <span class="vb0">{{ values.b[0] }}</span>
    <span class="vb1">{{ values.b[1] }}</span>
  </template>
</Motion>
`,
      {
        data: {
          values: {
            a: [0, -10],
            b: [-10, 0],
          },
          config: {
            stiffness: 170,
            damping: 26,
            precision: 0.01,
          },
        },
        components: { Motion },
      }
    )
    vm.$('.va0').should.have.text('0')
    vm.values.a[0] = 10
    nextTick()
      .then(() => {
        this.step()
        vm.values.b[0] = 0
      })
      .then(() => {
        vm.$('.va0').should.have.text('0.4722222222222222')
        this.step()
      })
      .then(() => {
        vm.$('.va0').should.have.text('1.1897376543209877')
        vm.$('.vb0').should.have.text('-9.527777777777779')
        this.stepUntil(() => vm.$('.va0').text === '10')
      })
      .then(done)
  })
})
