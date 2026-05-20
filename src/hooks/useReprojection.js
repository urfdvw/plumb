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

function buildProgram(gl) {
  const prog = gl.createProgram()
  gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER))
  gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog))
  return prog
}

export default function useReprojection({ canvasRef, videoRef, videoReady, rotation, f35mm, videoSize }) {
  const glRef = useRef(null)
  const progRef = useRef(null)
  const texRef = useRef(null)
  const rafRef = useRef(null)
  const uniformsRef = useRef({})

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })
    if (!gl) return
    glRef.current = gl

    try {
      const prog = buildProgram(gl)
      progRef.current = prog
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
      texRef.current = tex

      uniformsRef.current = {
        uR: gl.getUniformLocation(prog, 'uR'),
        uFD: gl.getUniformLocation(prog, 'uFD'),
        uFS: gl.getUniformLocation(prog, 'uFS'),
        uK: gl.getUniformLocation(prog, 'uK'),
        uRes: gl.getUniformLocation(prog, 'uRes'),
        uImgRes: gl.getUniformLocation(prog, 'uImgRes'),
        uImg: gl.getUniformLocation(prog, 'uImg'),
      }
      gl.uniform1i(uniformsRef.current.uImg, 0)
      gl.uniform1f(uniformsRef.current.uK, 0.0)
    } catch (e) {
      console.error('WebGL setup error', e)
    }

    return () => { cancelAnimationFrame(rafRef.current) }
  }, [canvasRef])

  const renderFrame = useCallback(() => {
    const gl = glRef.current
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!gl || !canvas || !video || !videoReady) return

    const w = canvas.clientWidth * devicePixelRatio
    const h = canvas.clientHeight * devicePixelRatio
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = Math.round(w)
      canvas.height = Math.round(h)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    gl.bindTexture(gl.TEXTURE_2D, texRef.current)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)

    const u = uniformsRef.current
    const fp = focalPx(f35mm, canvas.width, canvas.height)
    gl.uniformMatrix3fv(u.uR, false, rotation)
    gl.uniform1f(u.uFD, fp)
    gl.uniform1f(u.uFS, fp)
    gl.uniform2f(u.uRes, canvas.width, canvas.height)
    // Use canvas dims as source space so the video fills the canvas exactly
    gl.uniform2f(u.uImgRes, canvas.width, canvas.height)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }, [canvasRef, videoRef, videoReady, rotation, f35mm, videoSize])

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

  return { gl: glRef }
}
