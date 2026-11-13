import * as THREE from 'three';

// Pixel pass: the scene is drawn small, then shown with a 1px outline from depth and an ordered dither.
export function makePost(renderer) {
  const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  rt.depthTexture = new THREE.DepthTexture(1, 1);
  const material = new THREE.ShaderMaterial({
    uniforms: { tColor: { value: rt.texture }, tDepth: { value: rt.depthTexture }, res: { value: new THREE.Vector2(1, 1) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
      uniform sampler2D tColor, tDepth; uniform vec2 res; varying vec2 vUv;
      const float B[16] = float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
      float D(vec2 o) { return texture2D(tDepth, vUv + o / res).r; }
      vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
      void main() {
        vec3 raw = texture2D(tColor, vUv).rgb;
        if (D(vec2(0.0)) > 0.9999) { gl_FragColor = vec4(pow(raw, vec3(1.0 / 2.2)), 1.0); return; } // empty background: no dither
        vec3 c = pow(aces(raw * 1.15), vec3(1.0 / 2.2));
        float d = D(vec2(0.0));
        float m = min(min(D(vec2(1.0, 0.0)), D(vec2(-1.0, 0.0))), min(D(vec2(0.0, 1.0)), D(vec2(0.0, -1.0))));
        if (d - m > 0.004) c *= 0.3;
        vec2 p = floor(vUv * res);
        float t = (B[int(mod(p.x, 4.0)) + int(mod(p.y, 4.0)) * 4] + 0.5) / 16.0 - 0.5;
        gl_FragColor = vec4(floor(c * 12.0 + t + 0.5) / 12.0, 1.0);
      }`,
    depthTest: false, depthWrite: false,
  });
  const postScene = new THREE.Scene();
  postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  return {
    setSize(w, h) { rt.setSize(w, h); material.uniforms.res.value.set(w, h); },
    render(scene, cam) {
      renderer.setRenderTarget(rt);
      renderer.render(scene, cam);
      renderer.setRenderTarget(null);
      renderer.render(postScene, postCam);
    },
  };
}
