/**
 * React Hook for Shader Materials
 * 
 * Manages loading and lifecycle of Three.js ShaderMaterial instances
 * from core shader configurations.
 */

import { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import type { MaterialDefinition, ShaderConfiguration } from '../../../../../core/types';
import { getShaderConfig } from '../../../../../core/shaders';
import {
  createShaderMaterial,
  createShaderMaterialFromDefinition,
  updateShaderUniforms,
} from './shader-material-factory';

/**
 * Hook to load shader material from core shader ID
 * Handles async texture loading with cleanup
 */
export const useShaderMaterial = (
  shaderId: string | undefined
): THREE.ShaderMaterial | undefined => {
  const [material, setMaterial] = useState<THREE.ShaderMaterial | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (!shaderId) {
      setMaterial(undefined);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(undefined);

    (async () => {
      try {
        const config = getShaderConfig(shaderId);
        if (!config) {
          throw new Error(`Shader '${shaderId}' not found`);
        }

        const loaded = await createShaderMaterial(config);

        if (isMounted) {
          setMaterial(loaded);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          setLoading(false);
          console.error(`Failed to load shader '${shaderId}':`, error);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [shaderId]);

  return material;
};

/**
 * Hook to load shader material from MaterialDefinition
 * Automatically extracts shaderId if present
 */
export const useShaderMaterialFromDefinition = (
  materialDef: MaterialDefinition | undefined
): THREE.ShaderMaterial | undefined => {
  const [material, setMaterial] = useState<THREE.ShaderMaterial | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  // Memoize to prevent unnecessary reloads
  const memoizedDef = useMemo(
    () => materialDef,
    [materialDef?.shaderId, materialDef?.shaderProperties]
  );

  useEffect(() => {
    if (!memoizedDef?.shaderId) {
      setMaterial(undefined);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(undefined);

    (async () => {
      try {
        const loaded = await createShaderMaterialFromDefinition(memoizedDef);

        if (isMounted) {
          setMaterial(loaded ?? undefined);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          setLoading(false);
          console.error('Failed to load shader material:', error);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [memoizedDef]);

  return material;
};

/**
 * Hook for shader uniform updates
 * Useful for real-time uniform changes (light direction, camera position, etc.)
 */
export const useShaderUniforms = (
  material: THREE.ShaderMaterial | undefined,
  uniformUpdates: Record<string, any> | undefined
) => {
  useEffect(() => {
    if (!material || !uniformUpdates) return;

    updateShaderUniforms(material, uniformUpdates);
  }, [material, uniformUpdates]);
};

/**
 * Hook for cabinet-specific shader material
 * Pre-configured for wood cabinet materials
 */
export const useCabinetShaderMaterial = (
  materialDef: MaterialDefinition | undefined
): THREE.ShaderMaterial | undefined => {
  return useShaderMaterialFromDefinition(materialDef);
};

/**
 * Hook for countertop-specific shader material
 * Pre-configured for quartz/stone materials
 */
export const useCountertopShaderMaterial = (
  materialDef: MaterialDefinition | undefined
): THREE.ShaderMaterial | undefined => {
  return useShaderMaterialFromDefinition(materialDef);
};

/**
 * Hook for room surface shader materials
 * Pre-configured for walls, floors, ceilings
 */
export const useRoomSurfaceShaderMaterial = (
  materialDef: MaterialDefinition | undefined
): THREE.ShaderMaterial | undefined => {
  return useShaderMaterialFromDefinition(materialDef);
};

/**
 * Hook to load multiple shader materials
 * Useful for components that need multiple shaders
 */
export const useShaderMaterials = (
  configs: Record<string, ShaderConfiguration | undefined>
): Record<string, THREE.ShaderMaterial | undefined> => {
  const [materials, setMaterials] = useState<Record<string, THREE.ShaderMaterial | undefined>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    (async () => {
      const loadedMaterials: Record<string, THREE.ShaderMaterial | undefined> = {};

      for (const [key, config] of Object.entries(configs)) {
        if (!config) continue;

        try {
          loadedMaterials[key] = await createShaderMaterial(config);
        } catch (error) {
          console.error(`Failed to load shader '${key}':`, error);
          loadedMaterials[key] = undefined;
        }
      }

      if (isMounted) {
        setMaterials(loadedMaterials);
        setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [configs]);

  return materials;
};

