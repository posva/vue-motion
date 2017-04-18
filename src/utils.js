export const raf = window.requestAnimationFrame.bind(window)
export const now = performance.now.bind(performance)
export const isArray = value => Array.isArray(value)
export const isObject = value => typeof value === 'object'
