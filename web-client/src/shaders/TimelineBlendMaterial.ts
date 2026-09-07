import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

export const TimelineBlendMaterial = shaderMaterial(
  {
    uBlend: 1.0, // 0 = Past, 1 = Present
    uColorPast: new THREE.Color('#d4a373'), // Sepia/sketch tone
    uColorPresent: new THREE.Color('#606c38'), // Modern green tone
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uBlend;
    uniform vec3 uColorPast;
    uniform vec3 uColorPresent;
    varying vec2 vUv;

    void main() {
      // Basic checkerboard pattern for visualization
      float pattern = mod(floor(vUv.x * 20.0) + floor(vUv.y * 20.0), 2.0);
      
      // Mix between sketch (past) and modern (present) based on uBlend
      vec3 finalColor = mix(uColorPast, uColorPresent, uBlend);
      
      // Apply pattern to make it look like a map grid
      finalColor -= pattern * 0.1;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

