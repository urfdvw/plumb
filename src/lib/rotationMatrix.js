// All angles in radians. Column-major flat arrays (9 elements).

export function Rx(a) {
  const c = Math.cos(a), s = Math.sin(a)
  return [1,0,0, 0,c,s, 0,-s,c]
}

export function Ry(a) {
  const c = Math.cos(a), s = Math.sin(a)
  return [c,0,-s, 0,1,0, s,0,c]
}

export function Rz(a) {
  const c = Math.cos(a), s = Math.sin(a)
  return [c,s,0, -s,c,0, 0,0,1]
}

// 3x3 matrix multiply: C = A * B (column-major)
export function matMul3(A, B) {
  const C = new Array(9).fill(0)
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 3; row++) {
      let sum = 0
      for (let k = 0; k < 3; k++) sum += A[k * 3 + row] * B[col * 3 + k]
      C[col * 3 + row] = sum
    }
  }
  return C
}

// R = Rx(pitch) * Rz(roll) * Ry(yaw)
export function buildRotation(pitchDeg, rollDeg, yawDeg) {
  const toRad = d => d * Math.PI / 180
  const pitch = Math.max(-75, Math.min(75, pitchDeg))
  return matMul3(matMul3(Rx(toRad(pitch)), Rz(toRad(rollDeg))), Ry(toRad(yawDeg)))
}
