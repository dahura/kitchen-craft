/**
 * Wood Cabinet PBR Shader Configuration
 */

import { ShaderConfiguration } from '../types';

export const WOOD_CABINET_SHADER_CONFIG: ShaderConfiguration = {
  id: 'wood-cabinet',
  name: 'Wood Cabinet PBR',
  description: 'Realistic wood cabinet material with normal mapping, roughness, and metalness support',

  uniforms: {
    uColorMap: { type: 'sampler2D', required: true, description: 'Base color/diffuse texture' },
    uNormalMap: { type: 'sampler2D', required: true, description: 'Surface normal map for detail' },
    uRoughnessMap: { type: 'sampler2D', required: true, description: 'Roughness/shininess map' },
    uMetalnessMap: { type: 'sampler2D', required: false, description: 'Metalness map (optional for wood)' },
    uAoMap: { type: 'sampler2D', required: false, description: 'Ambient occlusion map' },
    uLightDir: { type: 'vec3', required: true, description: 'Normalized light direction vector', defaultValue: { x: 1, y: 1, z: 1 } },
    uLightColor: { type: 'vec3', required: true, description: 'Light color (RGB)', defaultValue: { r: 1, g: 1, b: 1 } },
    uAmbientLight: { type: 'vec3', required: true, description: 'Ambient light color (RGB)', defaultValue: { r: 0.3, g: 0.3, b: 0.3 } },
    uRoughness: { type: 'float', required: true, description: 'Global roughness override (0-1)', defaultValue: 0.7 },
    uMetalness: { type: 'float', required: true, description: 'Global metalness value (0-1)', defaultValue: 0.0 },
    uViewPosition: { type: 'vec3', required: true, description: 'Camera/view position in world space', defaultValue: { x: 0, y: 1, z: 5 } },
    uTextureScale: { type: 'float', required: false, description: 'UV scale multiplier for texture tiling', defaultValue: 1.0 },
    uNormalMapIntensity: { type: 'float', required: false, description: 'Strength of normal map effect (0-2)', defaultValue: 1.0 },
  },

  varyings: {
    vUv: 'vec2',
    vNormal: 'vec3',
    vWorldNormal: 'vec3',
    vPosition: 'vec3',
    vWorldPosition: 'vec3',
    vTangent: 'vec3',
    vBitangent: 'vec3',
  },

  textureMaps: {
    uColorMap: { path: '/textures/cabinet/wood_diffuse.jpg', description: 'Wood color/diffuse map', mipmap: true },
    uNormalMap: { path: '/textures/cabinet/wood_normal.jpg', description: 'Wood surface normal map', mipmap: true },
    uRoughnessMap: { path: '/textures/cabinet/wood_roughness.jpg', description: 'Wood roughness/shininess map', mipmap: true },
    uMetalnessMap: { path: '/textures/cabinet/wood_metalness.jpg', description: 'Optional metalness map', mipmap: true },
    uAoMap: { path: '/textures/cabinet/wood_ao.jpg', description: 'Optional ambient occlusion map', mipmap: true },
  },

  properties: {
    type: 'pbr',
    roughness: 0.7,
    metalness: 0.0,
    normalMapIntensity: 1.0,
    receiveShadow: true,
    castShadow: true,
  },

  files: {
    vertex: './wood-cabinet/vertex.glsl',
    fragment: './wood-cabinet/fragment.glsl',
  },

  metadata: {
    version: '1.0.0',
    author: 'Kitchen-Craft Team',
    tags: ['wood', 'pbr', 'cabinet', 'furniture'],
  },
};

