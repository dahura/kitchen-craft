/**
 * Room Surface PBR Shader Configuration
 */

import { ShaderConfiguration } from '../types';

export const WHITE_PLASTER_WALL_SHADER_CONFIG: ShaderConfiguration = {
  id: 'white-plaster-wall',
  name: 'White Plaster Wall PBR',
  description: 'Realistic white plaster wall material for room surfaces',

  uniforms: {
    uColorMap: { type: 'sampler2D', required: true, description: 'Wall color/diffuse texture' },
    uNormalMap: { type: 'sampler2D', required: true, description: 'Wall surface normal map' },
    uRoughnessMap: { type: 'sampler2D', required: true, description: 'Wall roughness map' },
    uLightDir: { type: 'vec3', required: true, description: 'Normalized light direction', defaultValue: { x: 1, y: 1, z: 1 } },
    uLightColor: { type: 'vec3', required: true, description: 'Light color', defaultValue: { r: 1, g: 1, b: 1 } },
    uAmbientLight: { type: 'vec3', required: true, description: 'Ambient light', defaultValue: { r: 0.4, g: 0.4, b: 0.4 } },
    uRoughness: { type: 'float', required: true, description: 'Global roughness (typically high for matte walls)', defaultValue: 0.9 },
    uMetalness: { type: 'float', required: true, description: 'Metalness (0 for walls)', defaultValue: 0.0 },
    uViewPosition: { type: 'vec3', required: true, description: 'Camera position', defaultValue: { x: 0, y: 1, z: 5 } },
  },

  varyings: {
    vUv: 'vec2',
    vNormal: 'vec3',
    vWorldNormal: 'vec3',
    vPosition: 'vec3',
    vWorldPosition: 'vec3',
  },

  textureMaps: {
    uColorMap: { path: '/textures/rooms/walls/white-plaster/diffuse.jpg', description: 'Wall color map', mipmap: true },
    uNormalMap: { path: '/textures/rooms/walls/white-plaster/normal.exr', description: 'Wall normal map', mipmap: true },
    uRoughnessMap: { path: '/textures/rooms/walls/white-plaster/roughness.jpg', description: 'Wall roughness map', mipmap: true },
  },

  properties: {
    type: 'pbr',
    roughness: 0.9,
    metalness: 0.0,
    normalMapIntensity: 0.8,
    receiveShadow: true,
    castShadow: false,
  },

  files: {
    vertex: './room-surfaces/vertex.glsl',
    fragment: './room-surfaces/fragment.glsl',
  },

  metadata: {
    version: '1.0.0',
    author: 'Kitchen-Craft Team',
    tags: ['wall', 'pbr', 'room-surface', 'plaster'],
  },
};

