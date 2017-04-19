export const raf = window.requestAnimationFrame.bind(window)
export const now = performance.now.bind(performance)
export const isArray = Array.isArray.bind(Array)
export const isObject = value => typeof value === 'object'
