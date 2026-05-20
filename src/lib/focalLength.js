// 43.27mm = diagonal of 35mm film frame
const FILM_DIAG_MM = 43.27

export function focalPx(f35mm, canvasWidth, canvasHeight) {
  const diagPx = Math.sqrt(canvasWidth ** 2 + canvasHeight ** 2)
  return (diagPx / FILM_DIAG_MM) * f35mm
}
