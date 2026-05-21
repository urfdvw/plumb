import { useEffect, useRef, useCallback } from 'react'
import { VERTEX_SHADER, FRAGMENT_SHADER } from '../lib/shaders'
import { focalPx } from '../lib/focalLength'

function compileShader(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s))
  return s
}

function initGL(canvas) {
  const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })
  if (!gl) return null

  const prog = gl.createProgram()
  gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER))
  gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(prog, 'aPos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

  const u = {
    uR: gl.getUniformLocation(prog, 'uR'),
    uFD: gl.getUniformLocation(prog, 'uFD'),
    uFS: gl.getUniformLocation(prog, 'uFS'),
    uK: gl.getUniformLocation(prog, 'uK'),
    uRes: gl.getUniformLocation(prog, 'uRes'),
    uImgRes: gl.getUniformLocation(prog, 'uImgRes'),
    uImg: gl.getUniformLocation(prog, 'uImg'),
  }
  gl.uniform1i(u.uImg, 0)
  gl.uniform1f(u.uK, 0.0)

  return { gl, tex, u }
}

export default function useReprojection({ canvasRef, videoRef, videoReady, rotation, f35mm }) {
  const stateRef = useRef(null) // { gl, tex, u }
  const rafRef = useRef(null)

  // Set canvas pixel dimensions and (re)init WebGL whenever the canvas CSS size changes.
  // Setting canvas.width/height resets the WebGL context, so we must call initGL after.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let active = true

    function resize() {
      const rect = canvas.getBoundingClientRect()
      const w = Math.round((rect.width || window.innerWidth) * devicePixelRatio)
      const h = Math.round((rect.height || window.innerHeight) * devicePixelRatio)
      if (w === 0 || h === 0) return
      if (canvas.width === w && canvas.height === h) return
      canvas.width = w
      canvas.height = h
      // context was reset by the dimension change — re-init everything
      try {
        stateRef.current = initGL(canvas)
        if (stateRef.current) {
          stateRef.current.gl.viewport(0, 0, w, h)
        }
      } catch (e) {
        console.error('WebGL init error', e)
      }
    }

    // Initial sizing + init
    resize()

    const observer = new ResizeObserver(() => { if (active) resize() })
    observer.observe(canvas)

    return () => {
      active = false
      observer.disconnect()
    }
  }, [canvasRef])

  const renderFrame = useCallback(() => {
    const state = stateRef.current
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!state || !canvas || !video || !videoReady || canvas.width === 0) return
    if (video.readyState < 2) return  // no frame available yet

    const { gl, tex, u } = state
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)

    const fp = focalPx(f35mm, canvas.width, canvas.height)
    gl.uniformMatrix3fv(u.uR, false, rotation)
    gl.uniform1f(u.uFD, fp)
    gl.uniform1f(u.uFS, fp)
    gl.uniform2f(u.uRes, canvas.width, canvas.height)
    gl.uniform2f(u.uImgRes, canvas.width, canvas.height)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }, [canvasRef, videoRef, videoReady, rotation, f35mm])

  useEffect(() => {
    let active = true
    function loop() {
      if (!active) return
      renderFrame()
      rafRef.current = requestAnimationFrame(loop)
    }
    loop()
    return () => { active = false; cancelAnimationFrame(rafRef.current) }
  }, [renderFrame])

  return { stateRef }
}
