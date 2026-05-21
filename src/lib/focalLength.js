// Portrait 35mm frame short side = 24mm. Width-based formula gives correct
// horizontal FOV regardless of aspect ratio, avoiding diagonal-mismatch stretch.
const PORTRAIT_WIDTH_MM = 24

export function focalPx(f35mm, width) {
  return (width / PORTRAIT_WIDTH_MM) * f35mm
}
