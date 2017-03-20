const raf = window.requestAnimationFrame.bind(window)
const now = performance.now.bind(performance)

export {
  raf,
  now,
}
