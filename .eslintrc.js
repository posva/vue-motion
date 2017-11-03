module.exports = {
  root: true,
  extends: 'posva',
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 0,
  },
  globals: {
    requestAnimationFrame: true,
    performance: true,
  },
}
