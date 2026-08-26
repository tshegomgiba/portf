/**
 * The companion is a small jointed figure rather than a floating shape, so the
 * way it holds itself is described here as a set of joint angles. Every pose
 * lists the same channels, which lets any two of them be mixed together: that
 * is what turns scrolling between sections into a real transition rather than a
 * swap. Arms hang down from the shoulder, so a negative `shoulderX` swings the
 * hand forward and a positive `elbow` folds the forearm back up.
 */
export const CHANNELS = [
  "sit",
  "spine",
  "headX",
  "shoulderLX",
  "shoulderLZ",
  "elbowL",
  "shoulderRX",
  "shoulderRZ",
  "elbowR",
  "hip",
  "knee",
];

export const POSES = {
  // Hovering with the legs tucked, arms loose at its sides.
  idle: {
    sit: 0,
    spine: 0,
    headX: 0,
    shoulderLX: -0.1,
    shoulderLZ: -0.22,
    elbowL: 0.28,
    shoulderRX: -0.1,
    shoulderRZ: 0.22,
    elbowR: 0.28,
    hip: -0.5,
    knee: 0.9,
  },

  // Seated, both hands cradling a tablet, head tipped down to read it.
  read: {
    sit: 1,
    spine: 0.14,
    headX: 0.42,
    shoulderLX: -1.05,
    shoulderLZ: 0.16,
    elbowL: 0.95,
    shoulderRX: -1.05,
    shoulderRZ: -0.16,
    elbowR: 0.95,
    hip: -1.45,
    knee: 1.5,
  },

  // Seated at the desk with both hands resting on the keyboard.
  type: {
    sit: 1,
    spine: 0.2,
    headX: 0.3,
    shoulderLX: -1.2,
    shoulderLZ: 0.14,
    elbowL: 0.62,
    shoulderRX: -1.2,
    shoulderRZ: -0.14,
    elbowR: 0.62,
    hip: -1.45,
    knee: 1.5,
  },

  // Hovering with the right arm extended to pick an icon out of the ring.
  reach: {
    sit: 0,
    spine: 0.05,
    headX: 0.1,
    shoulderLX: -0.3,
    shoulderLZ: -0.3,
    elbowL: 0.4,
    shoulderRX: -1.35,
    shoulderRZ: -0.05,
    elbowR: 0.18,
    hip: -0.55,
    knee: 1,
  },

  // Both hands out in front, turning a project panel over.
  hold: {
    sit: 0,
    spine: 0.1,
    headX: 0.22,
    shoulderLX: -1.15,
    shoulderLZ: 0.3,
    elbowL: 0.5,
    shoulderRX: -1.15,
    shoulderRZ: -0.3,
    elbowR: 0.5,
    hip: -0.5,
    knee: 0.95,
  },

  // Right hand up at the side of its head, holding a handset.
  call: {
    sit: 0,
    spine: 0,
    headX: -0.04,
    shoulderLX: -0.25,
    shoulderLZ: -0.28,
    elbowL: 0.35,
    shoulderRX: -0.35,
    shoulderRZ: 1.95,
    elbowR: 1.55,
    hip: -0.5,
    knee: 0.9,
  },

  // Travelling between scenes: arms swept back, leaning into the direction of
  // flight. Mixed in on top of the other poses by how far along the hop it is.
  fly: {
    sit: 0,
    spine: -0.25,
    headX: -0.18,
    shoulderLX: 0.85,
    shoulderLZ: -0.45,
    elbowL: 0.2,
    shoulderRX: 0.85,
    shoulderRZ: 0.45,
    elbowR: 0.2,
    hip: -0.15,
    knee: 0.35,
  },
};

export const makePose = () =>
  CHANNELS.reduce((pose, key) => {
    pose[key] = POSES.idle[key];
    return pose;
  }, {});

/** Write `a` mixed with `b` into `out`, without allocating. */
export const mixPose = (out, a, b, t) => {
  for (let i = 0; i < CHANNELS.length; i += 1) {
    const key = CHANNELS[i];
    out[key] = a[key] + (b[key] - a[key]) * t;
  }
  return out;
};

/** Ease `pose` toward `goal`, framerate independent. */
export const easePose = (pose, goal, rate) => {
  for (let i = 0; i < CHANNELS.length; i += 1) {
    const key = CHANNELS[i];
    pose[key] += (goal[key] - pose[key]) * rate;
  }
  return pose;
};
