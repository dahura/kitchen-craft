/**
 * Quartz Countertop PBR Shader Configuration
 */

import { ShaderConfiguration } from '../types';

export const QUARTZ_COUNTERTOP_SHADER_CONFIG: ShaderConfiguration = {
  id: 'quartz-countertop',
  name: 'Quartz Countertop PBR',
  description: 'Realistic quartz countertop material with sparkle effect and glossy finish',

  uniforms: {
    uColorMap: { type: 'sampler2D', required: true, description: 'Base color/diffuse texture' },
    uNormalMap: { type: 'sampler2D', required: true, description: 'Surface normal map' },
    uRoughnessMap: { type: 'sampler2D', required: true, description: 'Roughness map (typically low for countertops)' },
    uLightDir: { type: 'vec3', required: true, description: 'Normalized light direction', defaultValue: { x: 1, y: 1, z: 1 } },
    uLightColor: { type: 'vec3', required: true, description: 'Light color', defaultValue: { r: 1, g: 1, b: 1 } },
    uAmbientLight: { type: 'vec3', required: true, description: 'Ambient light', defaultValue: { r: 0.5, g: 0.5, b: 0.5 } },
    uRoughness: { type: 'float', required: true, description: 'Global roughness (0.1-0.4 for glossy countertop)', defaultValue: 0.2 },
    uMetalness: { type: 'float', required: true, description: 'Metalness (typically 0 for quartz)', defaultValue: 0.0 },
    uViewPosition: { type: 'vec3', required: true, description: 'Camera position', defaultValue: { x: 0, y: 1, z: 5 } },
    uSparkleIntensity: { type: 'float', required: false, description: 'Sparkle/reflection intensity (0-1)', defaultValue: 0.3 },
  },

  varyings: {
    vUv: 'vec2',
    vNormal: 'vec3',
    vWorldNormal: 'vec3',
    vPosition: 'vec3',
    vWorldPosition: 'vec3',
  },

  textureMaps: {
    uColorMap: { path: '/textures/countertop/quartz_diffuse.jpg', description: 'Quartz color map', mipmap: true },
    uNormalMap: { path: '/textures/countertop/quartz_normal.jpg', description: 'Quartz normal map', mipmap: true },
    uRoughnessMap: { path: '/textures/countertop/quartz_roughness.jpg', description: 'Quartz roughness map', mipmap: true },
  },

  properties: {
    type: 'pbr',
    roughness: 0.2,
    metalness: 0.0,
    normalMapIntensity: 1.0,
    receiveShadow: true,
    castShadow: true,
  },

  files: {
    vertex: './countertop/vertex.glsl',
    fragment: './countertop/fragment.glsl',
  },

  metadata: {
    version: '1.0.0',
    author: 'Kitchen-Craft Team',
    tags: ['quartz', 'pbr', 'countertop', 'glossy'],
  },
};

