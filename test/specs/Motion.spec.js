import Motion from 'src/Motion'
import {
  createVM,
  nextTick,
  delay
} from '../helpers'

describe('Motion', function () {
  it('renders an upgraded button', function (done) {
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
      precision: 0.01
    }
  },
  components: { Motion }
})
    vm.$('pre').should.have.text('0')
    vm.n = 400
    nextTick()
      .then(() => delay(700))
      .then(done)
  })

  it('works with jsx', function () {
    const vm = createVM(this, function (h) {
      const options = {
        scopedSlots: {
          default: values => (
            <pre>{values}</pre>
          )
        }
      }
      return (
        <Motion value={this.n}
                spring={this.config}
                {...options}
        />
      )
    }, {
      data: {
        n: 0,
        config: {
          stiffness: 170,
          damping: 26,
          precision: 0.01
        }
      },
      components: { Motion }
    })
    vm
  })
})
