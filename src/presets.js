/* @flow */
export default {
  noWobble: { stiffness: 170, damping: 26, precision: 0.01 }, // the default, if nothing provided
  gentle: { stiffness: 120, damping: 14, precision: 0.01 },
  wobbly: { stiffness: 180, damping: 12, precision: 0.01 },
  stiff: { stiffness: 210, damping: 20, precision: 0.01 },
}
