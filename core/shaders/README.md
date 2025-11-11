# Kitchen-Craft Shader System

## Overview

The shader system is a **framework-agnostic** collection of PBR (Physically Based Rendering) shaders designed for realistic kitchen visualization. All shaders are pure GLSL with TypeScript configurations, enabling portability across any rendering framework.

## Architecture

```
Core (Framework-Agnostic)          UI Layer (React + Three.js)
┌─────────────────────────┐        ┌──────────────────────────┐
│  core/shaders/          │        │  app/builders/           │
│  ├── types.ts           │        │  ├── shader-material-    │
│  ├── *.glsl (pure)      │───────→│  │   factory.ts          │
│  └── configs/           │        │  ├── useShaderMaterial.ts│
│                         │        │  └── lighting-manager.ts │
└─────────────────────────┘        └──────────────────────────┘
     (Zero dependencies)            (React + Three.js imports)
```

### Layer Separation

| Layer | What | Dependencies |
|-------|------|--------------|
| **core/shaders/** | Type definitions, GLSL files, config structures | ❌ None |
| **app/builders/** | Three.js material creation, React hooks | ✅ React, Three.js |

## Quick Start

### Using Shader Materials in Components

```typescript
import { useShaderMaterialFromDefinition } from './shader-material-factory';
import type { RenderableModule } from '@/core/types';

export const MyComponent = ({ module }: { module: RenderableModule }) => {
  // Load shader material automatically
  const material = useShaderMaterialFromDefinition(module.materials?.facade);

  if (!material) return null;

  return (
    <mesh material={material}>
      <boxGeometry />
    </mesh>
  );
};
```

### With Lighting

```typescript
import { useLightingManager, buildLightingUniforms } from './lighting-manager';
import { useShaderUniforms } from './useShaderMaterial';

export const KitchenScene = ({ scene }) => {
  // Setup lighting
  const lighting = useLightingManager(scene);
  const lightingUniforms = lighting.getShaderUniforms();

  // Update shader with lighting
  useShaderUniforms(shaderMaterial, lightingUniforms);
};
```

## Directory Structure

```
core/shaders/                               # 🔵 Framework-Agnostic
├── index.ts                               # Export hub & catalog
├── types.ts                               # Type definitions
├── README.md                              # This file
├── wood-cabinet/
│   ├── vertex.glsl                        # Vertex shader
│   ├── fragment.glsl                      # Fragment shader (Cook-Torrance BRDF)
│   └── config.ts                          # Configuration & uniforms
├── countertop/
│   ├── vertex.glsl
│   ├── fragment.glsl
│   └── config.ts
├── room-surfaces/
│   ├── vertex.glsl
│   ├── fragment.glsl
│   └── config.ts
└── utils/
    └── shader-loader.ts                   # Validation utilities

app/builders/                               # 🟡 React + Three.js
├── shader-material-factory.ts             # Core configs → THREE.ShaderMaterial
├── useShaderMaterial.ts                   # React hooks
└── lighting-manager.ts                    # Lighting system
```

## Available Shaders

### 1. Wood Cabinet (`wood-cabinet`)

**Material Type**: PBR Wood  
**Finish**: Matte to semi-gloss  
**Use Case**: Cabinet facades, furniture

```typescript
const config = getShaderConfig('wood-cabinet');
// roughness: 0.7 (matte wood)
// metalness: 0.0 (non-metallic)
// Features: Normal mapping, roughness mapping, tangent-space lighting
```

**Key Uniforms**:
- `uColorMap`: Wood diffuse color
- `uNormalMap`: Surface detail
- `uRoughnessMap`: Shininess variation
- `uLightDir`: Light direction (vec3)
- `uViewPosition`: Camera position

**Technical Details**:
- Cook-Torrance BRDF implementation
- GGX distribution function
- Schlick-GGX geometry
- Tangent-space normal mapping
- Tone mapping + gamma correction

### 2. Quartz Countertop (`quartz-countertop`)

**Material Type**: PBR Stone  
**Finish**: Highly glossy  
**Use Case**: Countertops, polished surfaces

```typescript
const config = getShaderConfig('quartz-countertop');
// roughness: 0.2 (glossy)
// metalness: 0.0
// Features: Sparkle effect, high specularity
```

**Special Uniforms**:
- `uSparkleIntensity`: Sparkle/shimmer effect (0-1)

### 3. Room Surfaces (`white-plaster-wall`)

**Material Type**: PBR Matte  
**Finish**: Very matte  
**Use Case**: Walls, ceilings, floors

```typescript
const config = getShaderConfig('white-plaster-wall');
// roughness: 0.9 (very matte)
// metalness: 0.0
// Features: Optimized for large flat surfaces
```

## Integration Guide

### Step 1: Enable Shader in Material Definition

```typescript
// In core/types.ts or when creating material
const material: MaterialDefinition = {
  type: 'cabinet',
  color: '#8B4513',
  shaderId: 'wood-cabinet',  // ← Enable shader
  shaderProperties: {
    normalMapIntensity: 1.2,
    receiveShadow: true,
  },
};
```

### Step 2: Use Hook in Component

```typescript
import { useCabinetShaderMaterial } from './useShaderMaterial';

export const CabinetFacade = ({ material }: { material: MaterialDefinition }) => {
  const shaderMaterial = useCabinetShaderMaterial(material);

  if (!shaderMaterial) {
    // Fallback while loading
    return <meshStandardMaterial color={material.color} />;
  }

  return <mesh material={shaderMaterial}>...</mesh>;
};
```

### Step 3: Setup Lighting

```typescript
import { useLightingManager, DEFAULT_LIGHTING } from './lighting-manager';

export const Scene = ({ scene }) => {
  // Create lighting manager
  const lighting = useLightingManager(scene, DEFAULT_LIGHTING);

  // Update shader uniforms with lighting
  useShaderUniforms(shaderMaterial, lighting.getShaderUniforms());

  // Optional: Animate time of day
  useFrame(({ clock }) => {
    const timeOfDay = (clock.getElapsedTime() / 60) % 1;
    const newLighting = createTimeOfDayLighting(timeOfDay);
    lighting.setLighting(newLighting);
  });
};
```

## Creating Custom Shaders

### 1. Create Directory Structure

```bash
mkdir -p core/shaders/my-material
touch core/shaders/my-material/{vertex.glsl,fragment.glsl,config.ts}
```

### 2. Write GLSL Shaders

**vertex.glsl** - Must output required varyings:

```glsl
#version 330 core

layout(location = 0) in vec3 position;
layout(location = 1) in vec3 normal;
layout(location = 2) in vec2 uv;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
```

**fragment.glsl** - Implement your lighting model:

```glsl
#version 330 core

uniform sampler2D uColorMap;
uniform vec3 uLightDir;
uniform vec3 uViewPosition;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  vec3 color = texture2D(uColorMap, vUv).rgb;
  vec3 N = normalize(vNormal);
  vec3 L = normalize(uLightDir);
  
  float diff = max(dot(N, L), 0.0);
  vec3 diffuse = diff * color;
  
  gl_FragColor = vec4(diffuse, 1.0);
}
```

### 3. Create Configuration

```typescript
// core/shaders/my-material/config.ts
import { ShaderConfiguration } from '../types';

export const MY_MATERIAL_CONFIG: ShaderConfiguration = {
  id: 'my-material',
  name: 'My Custom Material',
  description: 'Custom shader for special material',
  
  uniforms: {
    uColorMap: {
      type: 'sampler2D',
      required: true,
      description: 'Base color texture',
    },
    uLightDir: {
      type: 'vec3',
      required: true,
      description: 'Light direction',
      defaultValue: { x: 1, y: 1, z: 1 },
    },
    uViewPosition: {
      type: 'vec3',
      required: true,
      description: 'Camera position',
      defaultValue: { x: 0, y: 1, z: 5 },
    },
  },
  
  varyings: {
    vUv: 'vec2',
    vNormal: 'vec3',
    vWorldPosition: 'vec3',
  },
  
  textureMaps: {
    uColorMap: {
      path: '/textures/my-material/diffuse.jpg',
      mipmap: true,
    },
  },
  
  properties: {
    type: 'pbr',
    roughness: 0.5,
    metalness: 0.0,
  },
  
  files: {
    vertex: './my-material/vertex.glsl',
    fragment: './my-material/fragment.glsl',
  },
};
```

### 4. Register in Catalog

```typescript
// core/shaders/index.ts
import { MY_MATERIAL_CONFIG } from './my-material/config';

export const SHADER_CATALOG: ShaderCatalog = {
  // ... existing shaders
  'my-material': MY_MATERIAL_CONFIG,
};
```

## PBR Theory

### Roughness (0-1)
- **0** = Mirror-like, highly reflective
- **0.5** = Moderately rough (satin finish)
- **1** = Completely matte (diffuse)

### Metalness (0-1)
- **0** = Non-metallic (dielectric, has fixed F0=0.04)
- **1** = Fully metallic (conductor, uses material color as F0)

### Normal Mapping
- Adds surface detail without geometry
- Uses tangent-space representation
- Intensity-controllable for artistic variation

### Cook-Torrance BRDF

```
L_out = ∫ f_r(L_in, L_out) * L_in * cos(θ) dω

where:
f_r = k_d * (c/π) + k_s * (DFG / (4(N·L)(N·V)))

D = GGX distribution
F = Fresnel (Schlick approximation)
G = Geometry function (Schlick-GGX)
k_d = diffuse albedo
k_s = specular (Fresnel result)
```

## Performance Optimization

### Texture Optimization
- Use mipmaps for filtered lookups
- Compress textures (WebP, ASTC)
- Use appropriate texture sizes (1K, 2K)

### Shader Optimization
- Minimize texture lookups in fragment shader
- Use `precision mediump` on mobile
- Avoid expensive operations (sin, cos) in hot paths

### Batching
- Group objects with same shader/material
- Use instancing for repeated geometry
- Batch light updates instead of per-frame

## Troubleshooting

### Shader Compilation Errors
Check console for GLSL syntax errors. Common issues:
- Missing `void main()`
- Undefined variables or uniforms
- Type mismatches (vec3 vs vec4)

### Black/Wrong Colors
- Check texture paths are loading correctly
- Verify uniforms are initialized
- Check gamma correction isn't double-applied

### Performance Issues
- Profile with DevTools (GPU tab)
- Reduce texture resolution
- Use simpler shaders (fewer texture lookups)
- Check for redundant material updates

## References

- [Three.js ShaderMaterial Docs](https://threejs.org/docs/#api/en/materials/ShaderMaterial)
- [LearnOpenGL PBR](https://learnopengl.com/PBR/Theory)
- [Khronos PBR Specification](https://github.com/KhronosGroup/glTF-Sample-Models)
- [Cook-Torrance BRDF](https://en.wikipedia.org/wiki/Specular_highlight#Cook%E2%80%93Torrance_model)
- [GLSL Reference](https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language)

## Future Enhancements

- [ ] Parallax/displacement mapping
- [ ] Screen-space ambient occlusion (SSAO)
- [ ] Subsurface scattering for translucent materials
- [ ] Anisotropic highlights
- [ ] Iridescence effects
- [ ] Shader graph editor UI
- [ ] Material preview system
- [ ] Shader hot-reload in development

