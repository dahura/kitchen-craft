/**
 * Shader Material Factory
 * 
 * Creates Three.js ShaderMaterial instances from core shader configurations.
 * Bridges the framework-agnostic core/ layer with Three.js rendering.
 * 
 * This is the main integration point between core shader configs and Three.js.
 */

import * as THREE from 'three';
import type { ShaderConfiguration, MaterialDefinition } from '../../../../../core/types';
import { getShaderConfig } from '../../../../../core/shaders';
import { validateShaderConfig } from '../../../../../core/shaders/utils/shader-loader';

/**
 * Shader source loader for Three.js
 * In production, this would load from filesystem or via fetch
 * For now, we return shader sources that are bundled
 */
async function loadShaderSource(shaderPath: string): Promise<string> {
  // For now, return placeholder
  // In a real implementation, this would:
  // - Fetch .glsl file from public/ directory
  // - Or import as bundled string via webpack/vite
  console.warn(`loadShaderSource not yet implemented for: ${shaderPath}`);
  return '';
}

/**
 * Build Three.js uniforms object from shader config
 * Maps shader config uniform definitions to Three.js uniform format
 */
export function buildThreeJSUniforms(config: ShaderConfiguration): Record<string, THREE.IUniform> {
  const uniforms: Record<string, THREE.IUniform> = {};

  // Texture uniforms
  if (config.textureMaps) {
    Object.entries(config.textureMaps).forEach(([uniformName, mapDef]) => {
      // Load texture if path provided, otherwise undefined
      uniforms[uniformName] = {
        value: null, // Will be populated when texture loads
      };
    });
  }

  // Non-texture uniforms with defaults
  Object.entries(config.uniforms).forEach(([uniformName, uniformDef]) => {
    if (uniformDef.type === 'sampler2D') {
      // Skip samplers here, handled above
      return;
    }

    const defaultValue = uniformDef.defaultValue;

    switch (uniformDef.type) {
      case 'float':
        uniforms[uniformName] = { value: (defaultValue as number) ?? 0.0 };
        break;
      case 'int':
        uniforms[uniformName] = { value: (defaultValue as number) ?? 0 };
        break;
      case 'bool':
        uniforms[uniformName] = { value: (defaultValue as boolean) ?? false };
        break;
      case 'vec2':
        uniforms[uniformName] = {
          value: new THREE.Vector2(
            (defaultValue as { x: number; y: number })?.x ?? 0,
            (defaultValue as { x: number; y: number })?.y ?? 0
          ),
        };
        break;
      case 'vec3':
        uniforms[uniformName] = {
          value: new THREE.Vector3(
            (defaultValue as { x?: number; r?: number })?.x ?? (defaultValue as { x?: number; r?: number })?.r ?? 0,
            (defaultValue as { y?: number; g?: number })?.y ?? (defaultValue as { y?: number; g?: number })?.g ?? 0,
            (defaultValue as { z?: number; b?: number })?.z ?? (defaultValue as { z?: number; b?: number })?.b ?? 0
          ),
        };
        break;
      case 'vec4':
        uniforms[uniformName] = {
          value: new THREE.Vector4(
            (defaultValue as any)?.x ?? 0,
            (defaultValue as any)?.y ?? 0,
            (defaultValue as any)?.z ?? 0,
            (defaultValue as any)?.w ?? 1
          ),
        };
        break;
      case 'mat3':
        uniforms[uniformName] = {
          value: new THREE.Matrix3(),
        };
        break;
      case 'mat4':
        uniforms[uniformName] = {
          value: new THREE.Matrix4(),
        };
        break;
    }
  });

  return uniforms;
}

/**
 * Load textures for shader
 * Returns map of uniform name to THREE.Texture
 */
export async function loadShaderTextures(config: ShaderConfiguration): Promise<Map<string, THREE.Texture>> {
  const textureLoader = new THREE.TextureLoader();
  const textures = new Map<string, THREE.Texture>();

  if (!config.textureMaps) {
    return textures;
  }

  try {
    for (const [uniformName, mapDef] of Object.entries(config.textureMaps)) {
      try {
        const texture = await textureLoader.loadAsync(mapDef.path);
        
        // Set texture properties
        if (mapDef.mipmap) {
          texture.generateMipmaps = true;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
        } else {
          texture.minFilter = THREE.LinearFilter;
        }
        
        texture.magFilter = THREE.LinearFilter;
        
        textures.set(uniformName, texture);
      } catch (error) {
        console.warn(`Failed to load texture ${mapDef.path}:`, error);
      }
    }
  } catch (error) {
    console.error('Error loading shader textures:', error);
  }

  return textures;
}

/**
 * Create Three.js ShaderMaterial from core shader configuration
 * This is the main factory function
 */
export async function createShaderMaterial(config: ShaderConfiguration): Promise<THREE.ShaderMaterial> {
  // Validate configuration
  const validation = validateShaderConfig(config);
  if (!validation.valid) {
    throw new Error(`Invalid shader config '${config.id}': ${validation.errors.join(', ')}`);
  }

  // Load shader sources
  const vertexSource = await loadShaderSource(config.files.vertex);
  const fragmentSource = await loadShaderSource(config.files.fragment);

  // Build uniforms with defaults
  const uniforms = buildThreeJSUniforms(config);

  // Load textures and populate texture uniforms
  const textures = await loadShaderTextures(config);
  textures.forEach((texture, uniformName) => {
    if (uniforms[uniformName]) {
      uniforms[uniformName].value = texture;
    }
  });

  // Create material
  const material = new THREE.ShaderMaterial({
    vertexShader: vertexSource,
    fragmentShader: fragmentSource,
    uniforms,
    side: THREE.FrontSide,
    flatShading: false,
    wireframe: false,
  });

  // Apply shader properties
  material.shadowMap = config.properties.receiveShadow ? THREE.PCFShadowMap : undefined;
  material.castShadow = config.properties.castShadow ?? false;
  material.receiveShadow = config.properties.receiveShadow ?? false;

  return material;
}

/**
 * Create shader material from MaterialDefinition
 * Convenience function that extracts shaderId and creates material
 */
export async function createShaderMaterialFromDefinition(
  materialDef: MaterialDefinition | undefined
): Promise<THREE.ShaderMaterial | null> {
  if (!materialDef?.shaderId) {
    return null;
  }

  const config = getShaderConfig(materialDef.shaderId);
  if (!config) {
    console.warn(`Shader '${materialDef.shaderId}' not found in catalog`);
    return null;
  }

  // Merge material shader properties with config if provided
  if (materialDef.shaderProperties) {
    Object.assign(config.properties, materialDef.shaderProperties);
  }

  return createShaderMaterial(config);
}

/**
 * Update shader uniforms at runtime
 * Useful for updating light direction, camera position, etc.
 */
export function updateShaderUniforms(
  material: THREE.ShaderMaterial,
  updates: Record<string, any>
): void {
  Object.entries(updates).forEach(([uniformName, value]) => {
    if (uniformName in material.uniforms) {
      const uniform = material.uniforms[uniformName];

      if (value instanceof THREE.Vector2 || value instanceof THREE.Vector3 || value instanceof THREE.Vector4) {
        uniform.value = value;
      } else if (value instanceof THREE.Texture) {
        uniform.value = value;
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        uniform.value = value;
      }

      uniform.needsUpdate = true;
    }
  });
}

/**
 * Clone shader material with new uniforms
 * Useful for creating material variations
 */
export function cloneShaderMaterial(
  material: THREE.ShaderMaterial,
  uniformOverrides?: Record<string, any>
): THREE.ShaderMaterial {
  const cloned = material.clone() as THREE.ShaderMaterial;

  if (uniformOverrides) {
    updateShaderUniforms(cloned, uniformOverrides);
  }

  return cloned;
}

