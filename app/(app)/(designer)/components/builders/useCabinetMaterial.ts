/**
 * Hook for managing cabinet materials
 * Handles async loading of textures and memoization for performance
 */

import { useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import type { MaterialDefinition } from "../../../../../core/types";
import { createMaterialFromDefinition } from "./cabinet-material-utils";

/**
 * Hook to load and manage cabinet materials
 * Returns a Three.js material or undefined while loading
 */
export const useCabinetMaterial = (
  materialDef: MaterialDefinition | undefined,
): THREE.Material | undefined => {
  const [material, setMaterial] = useState<THREE.Material | undefined>(
    undefined,
  );

  // Memory: Using useMemo to avoid unnecessary re-renders when material definition hasn't changed
  const memoizedDef = useMemo(
    () => materialDef,
    [materialDef?.type, materialDef?.color, materialDef?.diffuseMap],
  );

  useEffect(() => {
    let isMounted = true;

    const loadMaterial = async () => {
      try {
        console.log("useCabinetMaterial: Loading material", memoizedDef);
        const loadedMaterial =
          await createMaterialFromDefinition(memoizedDef);
        if (isMounted) {
          console.log("useCabinetMaterial: Material loaded successfully");
          setMaterial(loadedMaterial);
        }
      } catch (error) {
        console.error("Failed to load cabinet material:", error);
        if (isMounted) {
          console.log(
            "useCabinetMaterial: Using fallback material with color",
            memoizedDef?.color,
          );
          // Set fallback material
          setMaterial(
            new THREE.MeshStandardMaterial({
              color: memoizedDef?.color || "#CCCCCC",
            }),
          );
        }
      }
    };

    loadMaterial();

    return () => {
      isMounted = false;
    };
  }, [memoizedDef]);

  return material;
};

/**
 * Hook to load multiple cabinet materials at once
 * Useful for rendering complex cabinet structures
 */
export const useCabinetMaterials = (
  materialDefs: Record<string, MaterialDefinition | undefined>,
): Record<string, THREE.Material | undefined> => {
  const [materials, setMaterials] = useState<
    Record<string, THREE.Material | undefined>
  >({});

  useEffect(() => {
    let isMounted = true;

    const loadMaterials = async () => {
      const loadedMaterials: Record<string, THREE.Material | undefined> = {};

      for (const [key, materialDef] of Object.entries(materialDefs)) {
        try {
          loadedMaterials[key] =
            await createMaterialFromDefinition(materialDef);
        } catch (error) {
          console.error(`Failed to load material ${key}:`, error);
          loadedMaterials[key] = new THREE.MeshStandardMaterial({
            color: materialDef?.color || "#CCCCCC",
          });
        }
      }

      if (isMounted) {
        setMaterials(loadedMaterials);
      }
    };

    loadMaterials();

    return () => {
      isMounted = false;
    };
  }, [materialDefs]);

  return materials;
};

