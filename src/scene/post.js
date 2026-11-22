import * as THREE from 'three';

// Ink pass: the scene is drawn once (with MSAA), then shown with a dark outline wherever the depth jumps or bends.
// The camera is orthographic, so depth is linear: flat surfaces have zero second difference, edges and creases do not.
export function makePost(renderer) {
  const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
  rt.depthTexture = new THREE.DepthTexture(1, 1);
  const material = new THREE.ShaderMaterial({
    uniforms: { tColor: { value: rt.texture }, tDepth: { value: rt.depthTexture }, step: { value: new THREE.Vector2(1, 1) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
      uniform sampler2D tColor, tDepth; uniform vec2 step; varying vec2 vUv;
      float D(vec2 o) { return texture2D(tDepth, vUv + o * step).r; }
      vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
      void main() {
        vec3 raw = texture2D(tColor, vUv).rgb;
        float d = D(vec2(0.0));
        vec3 c = d > 0.9999 ? pow(raw, vec3(1.0 / 2.2)) : pow(aces(raw * 1.15), vec3(1.0 / 2.2)); // empty background stays as set
        float bend = abs(D(vec2(1.0, 0.0)) + D(vec2(-1.0, 0.0)) + D(vec2(0.0, 1.0)) + D(vec2(0.0, -1.0)) - 4.0 * d);
        gl_FragColor = vec4(mix(c, vec3(0.07, 0.04, 0.1), 0.9 * smoothstep(0.00025, 0.0009, bend)), 1.0);
      }`,
    depthTest: false, depthWrite: false,
  });
  const postScene = new THREE.Scene();
  postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  return {
    // line: outline half-width in drawing-buffer pixels
    setSize(w, h, line = 1) { rt.setSize(w, h); material.uniforms.step.value.set(line / w, line / h); },
    render(scene, cam) {
      renderer.setRenderTarget(rt);
      renderer.render(scene, cam);
      renderer.setRenderTarget(null);
      renderer.render(postScene, postCam);
    },
  };
}
