/**
 * Cabinet Material Utilities
 * Handles loading and applying cabinet textures from the material library
 */

import * as THREE from "three";
import type { MaterialDefinition } from "../../../../../core/types";

// Texture cache for performance
const materialCache = new Map<string, THREE.Material>();
const textureLoader = new THREE.TextureLoader();

/**
 * Creates a Three.js material from MaterialDefinition
 * Supports both color-based (paint) and texture-based materials
 */
export const createMaterialFromDefinition = async (
  materialDef: MaterialDefinition | undefined,
): Promise<THREE.Material> => {
  if (!materialDef) {
    return new THREE.MeshStandardMaterial({ color: "#CCCCCC" });
  }

  // Memory: Using cache to avoid recreating materials for repeated use
  const cacheKey = JSON.stringify(materialDef);
  const cached = materialCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  console.log("Creating material from definition:", materialDef);

  const materialProps: Partial<THREE.MeshStandardMaterialParameters> = {
    side: THREE.DoubleSide,
    roughness: materialDef.roughnessOverride ?? materialDef.roughness ?? 0.5,
    metalness: materialDef.metalness ?? 0,
  };

  try {
    // Load diffuse map (main texture)
    if (materialDef.diffuseMap) {
      const diffuseTexture = await loadTexturePromise(materialDef.diffuseMap);
      materialProps.map = diffuseTexture;
    }

    // Load normal map for surface detail
    if (materialDef.normalMap) {
      const normalTexture = await loadTexturePromise(materialDef.normalMap);
      materialProps.normalMap = normalTexture;
    }

    // Load roughness map
    if (materialDef.roughnessMap) {
      const roughnessTexture = await loadTexturePromise(
        materialDef.roughnessMap,
      );
      materialProps.roughnessMap = roughnessTexture;
    }

    // Load displacement map
    if (materialDef.displacementMap) {
      const displacementTexture = await loadTexturePromise(
        materialDef.displacementMap,
      );
      materialProps.displacementMap = displacementTexture;
    }

    // Memory: Apply material variations (brightness, tint, emissive)
    // Apply color tint for brightness variation
    if (materialDef.colorTint) {
      materialProps.color = new THREE.Color(materialDef.colorTint);
    } else if (materialDef.brightness !== undefined) {
      // Apply brightness as a color multiplier
      const brightnessValue = materialDef.brightness * 2; // Convert 0-1 to 0-2 scale
      materialProps.color = new THREE.Color().setHSL(
        0,
        0,
        Math.min(brightnessValue, 1),
      );
    } else if (!materialDef.diffuseMap && materialDef.color) {
      // If no diffuse map but there's a color, use it
      materialProps.color = new THREE.Color(materialDef.color);
    }

    // Apply emissive properties for matte/glossy effects
    if (materialDef.emissiveIntensity !== undefined) {
      materialProps.emissiveIntensity = materialDef.emissiveIntensity;
    }

    const material = new THREE.MeshStandardMaterial(materialProps);
    materialCache.set(cacheKey, material);
    return material;
  } catch (error) {
    console.error("Failed to create material from definition:", error);
    // Fallback to simple color material
    return new THREE.MeshStandardMaterial({
      color: materialDef.color || "#CCCCCC",
      roughness: materialDef.roughness ?? 0.5,
      metalness: materialDef.metalness ?? 0,
    });
  }
};

/**
 * Loads a texture and returns it as a Promise
 */
const loadTexturePromise = (url: string): Promise<THREE.Texture> => {
  console.log(`Loading texture: ${url}`);
  return new Promise((resolve, reject) => {
    textureLoader.load(
      url,
      (texture) => {
        console.log(`✓ Texture loaded successfully: ${url}`);
        // Configure texture for optimal rendering
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        resolve(texture);
      },
      undefined,
      (error) => {
        console.error(`Failed to load texture: ${url}`, error);
        reject(error);
      },
    );
  });
};

/**
 * Clears the material cache to free up memory
 */
export const clearMaterialCache = (): void => {
  materialCache.forEach((material) => {
    material.dispose();
  });
  materialCache.clear();
};

