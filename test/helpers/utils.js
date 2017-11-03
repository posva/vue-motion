import Vue from 'vue/dist/vue'

Vue.config.productionTip = false

export function createVM (context, template, opts = {}) {
  const el = document.createElement('div')
  document.getElementById('tests').appendChild(el)
  const render = typeof template === 'string'
    ? { template: `<div>${template}</div>` }
    : { render: template }
  return new Vue({
    el,
    name: 'Test',
    ...render,
    ...opts,
  })
}

const emptyNodes = document.querySelectorAll('nonexistant')
Vue.prototype.$$ = function $$ (selector) {
  const els = document.querySelectorAll(selector)
  const vmEls = this.$el.querySelectorAll(selector)
  const fn = vmEls.length
    ? el => vmEls.find(el)
    : el => this.$el === el
  const found = Array.from(els).filter(fn)
  return found.length
    ? found
    : emptyNodes
}

Vue.prototype.$ = function $ (selector) {
  const els = document.querySelectorAll(selector)
  const vmEl = this.$el.querySelector(selector)
  const fn = vmEl
    ? el => el === vmEl
    : el => el === this.$el
  // Allow should chaining for tests
  return Array.from(els).find(fn) || emptyNodes
}

export { Vue }
