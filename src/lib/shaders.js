export const VERTEX_SHADER = `
  attribute vec2 aPos;
  varying vec2 vUV;
  void main() {
    vUV = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
  }
`

export const FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 vUV;

  uniform sampler2D uImg;
  uniform vec2 uRes;   // canvas resolution
  uniform vec2 uImgRes; // source image resolution
  uniform mat3 uR;     // rotation matrix
  uniform float uFD;   // dest focal length px
  uniform float uFS;   // source focal length px
  uniform float uK;    // fisheye blend (0=rectilinear)

  void main() {
    // Output pixel → normalized device coords centered
    vec2 pd = (vUV - 0.5) * uRes;

    // Back-project through destination (virtual corrected) camera
    vec3 ray = normalize(vec3(pd / uFD, 1.0));

    // Apply inverse rotation (transpose = inverse for orthogonal R)
    vec3 rr = transpose(uR) * ray;

    // Project onto source image plane
    if (rr.z <= 0.0) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }

    vec2 ps = (rr.xy / rr.z) * uFS;

    // Map to [0,1] UV in source
    vec2 uv = ps / uImgRes + 0.5;

    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
      gl_FragColor = texture2D(uImg, uv);
    }
  }
`
