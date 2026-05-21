// Rotation matrix matching reference implementation: R = Ry(yaw) × Rx(pitch) × Rz(roll)
// Column-major flat array for WebGL uniformMatrix3fv.
// R maps from virtual (corrected horizontal) camera space to actual (tilted) camera space.
export function buildRotation(pitchDeg, rollDeg, yawDeg) {
  const toRad = d => d * Math.PI / 180
  // Clamp pitch tightly — beyond ~20° almost no overlap with the camera's actual FOV
  const pitch = Math.max(-20, Math.min(20, pitchDeg))
  const y = toRad(yawDeg), p = toRad(pitch), r = toRad(rollDeg)
  const cy = Math.cos(y), sy = Math.sin(y)
  const cp = Math.cos(p), sp = Math.sin(p)
  const cr = Math.cos(r), sr = Math.sin(r)
  // Column-major: [col0_row0, col0_row1, col0_row2, col1_row0, ...]
  return [
    cy*cr + sy*sp*sr,   cp*sr,  -sy*cr + cy*sp*sr,
   -cy*sr + sy*sp*cr,   cp*cr,   sy*sr + cy*sp*cr,
    sy*cp,             -sp,       cy*cp
  ]
}
