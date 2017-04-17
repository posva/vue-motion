import Motion from './Motion'
import presets from './presets'

function plugin (Vue) {
  Vue.component('Motion', Motion)
}

// Install by default if using the script tag
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin)
}

export default plugin
const version = '__VERSION__'
// Export all components too
export { Motion, version, presets }
