export const raf = typeof window !== 'undefined'
  ? window.requestAnimationFrame.bind(window)
  : _ => {}
export const now = typeof performance !== 'undefined'
  ? performance.now.bind(performance)
  : Date.now.bind(Date)
export const isArray = Array.isArray.bind(Array)
export const isObject = value => value !== null && typeof value === 'object'
