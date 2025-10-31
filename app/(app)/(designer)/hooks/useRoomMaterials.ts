// hooks/useRoomMaterials.ts
import { useEffect, useState } from "react";
import * as THREE from "three";
import { useRoomMaterialsStore } from "@/app/lib/store/room-materials-store";
import {
  loadTextureSet,
  createColorMaterial,
  preloadTextures
} from "@/core/libraries/room-texture-library";
import {
  getRoomTextureSet
} from "@/core/libraries/room-texture-library";
import type { RoomMaterials, RoomSurfaceMaterial } from "@/core/types";

// Вспомогательная функция для создания материала
const createMaterial = async (
  surfaceMaterial: RoomSurfaceMaterial,
  surface: "walls" | "floors" | "ceilings"
): Promise<THREE.MeshStandardMaterial> => {
  if (surfaceMaterial.type === "color") {
    return createColorMaterial(
      surfaceMaterial.value as string,
      surfaceMaterial.roughness || 0.8,
      surfaceMaterial.metalness || 0.0
    );
  }

  // Для текстур
  const textureId = surfaceMaterial.value as string;
  const surfaceKey = surface === "ceilings" ? "ceilings" :
                   surface === "walls" ? "walls" : "floors";
  
  console.log("Creating material for:", { surface, surfaceKey, textureId, surfaceMaterial });
  
  const textureSet = getRoomTextureSet(
    surfaceKey as "walls" | "floors" | "ceilings",
    textureId
  );

  if (!textureSet) {
    console.warn(`Texture set "${textureId}" not found for ${surface}, using color fallback`);
    return createColorMaterial("#CCCCCC", 0.8, 0.0);
  }

  console.log("Found texture set:", textureSet);

  try {
    const material = await loadTextureSet(textureSet);
    
    // Применяем дополнительные свойства
    if (surfaceMaterial.roughness !== undefined) {
      material.roughness = surfaceMaterial.roughness;
    }
    if (surfaceMaterial.metalness !== undefined) {
      material.metalness = surfaceMaterial.metalness;
    }
    if (surfaceMaterial.scale !== undefined) {
      // Применяем масштаб ко всем текстурам
      Object.values(material).forEach((map) => {
        if (map && map instanceof THREE.Texture) {
          map.repeat.set(surfaceMaterial.scale!, surfaceMaterial.scale!);
        }
      });
    }

    return material;
  } catch (error) {
    console.error(`Failed to load texture set "${textureId}":`, error);
    return createColorMaterial("#CCCCCC", 0.8, 0.0);
  }
};

// Основной хук
export const useRoomMaterials = () => {
  const roomMaterials = useRoomMaterialsStore((state: any) => state.currentMaterials);
  const [materials, setMaterials] = useState<{
    walls: THREE.MeshStandardMaterial | null;
    floor: THREE.MeshStandardMaterial | null;
    ceiling: THREE.MeshStandardMaterial | null;
  }>({
    walls: null,
    floor: null,
    ceiling: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем материалы при изменении конфигурации
  useEffect(() => {
    let isMounted = true;

    const loadMaterials = async () => {
      setIsLoading(true);
      
      try {
        const [wallsMaterial, floorMaterial, ceilingMaterial] = await Promise.all([
          createMaterial(roomMaterials.walls, "walls"),
          createMaterial(roomMaterials.floor, "floors"),
          createMaterial(roomMaterials.ceiling, "ceilings"),
        ]);

        if (isMounted) {
          setMaterials({
            walls: wallsMaterial,
            floor: floorMaterial,
            ceiling: ceilingMaterial,
          });
        }
      } catch (error) {
        console.error("Failed to load room materials:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMaterials();

    // Cleanup
    return () => {
      isMounted = false;
    };
  }, [roomMaterials]);

  // Предзагрузка текстур при монтировании
  useEffect(() => {
    const preloadAllTextures = async () => {
      const textureSets: any[] = [];
      
      // Собираем все текстуры, которые нужно предзагрузить
      Object.entries(roomMaterials).forEach(([surface, material]) => {
        const surfaceMaterial = material as RoomSurfaceMaterial;
        if (surfaceMaterial.type === "texture") {
          const textureId = surfaceMaterial.value as string;
          const surfaceKey = surface === "ceilings" ? "ceilings" : 
                           surface === "walls" ? "walls" : "floors";
          const textureSet = getRoomTextureSet(
            surfaceKey as "walls" | "floors" | "ceilings",
            textureId
          );
          if (textureSet) {
            textureSets.push(textureSet);
          }
        }
      });

      if (textureSets.length > 0) {
        try {
          await preloadTextures(textureSets);
        } catch (error) {
          console.warn("Failed to preload textures:", error);
        }
      }
    };

    preloadAllTextures();
  }, [roomMaterials]);

  // Очистка ресурсов при размонтировании
  useEffect(() => {
    return () => {
      Object.values(materials).forEach((material) => {
        if (material) {
          material.dispose();
        }
      });
    };
  }, [materials]);

  return {
    materials,
    isLoading,
    roomMaterials,
  };
};

// Упрощенный хук для получения материала конкретной поверхности
export const useRoomSurfaceMaterial = (surface: "walls" | "floor" | "ceiling") => {
  const { materials, isLoading } = useRoomMaterials();
  
  return {
    material: materials[surface],
    isLoading,
  };
};

// Хук для управления материалами с удобным API
export const useRoomMaterialsManager = () => {
  const roomMaterials = useRoomMaterialsStore((state: any) => state.currentMaterials);
  const updateSurfaceMaterial = useRoomMaterialsStore((state: any) => state.updateSurfaceMaterial);
  const setSurfaceColor = useRoomMaterialsStore((state: any) => state.setSurfaceColor);
  const setSurfaceTexture = useRoomMaterialsStore((state: any) => state.setSurfaceTexture);
  const updateMaterialProperties = useRoomMaterialsStore((state: any) => state.updateMaterialProperties);
  const resetToDefaults = useRoomMaterialsStore((state: any) => state.resetToDefaults);
  const applyPreset = useRoomMaterialsStore((state: any) => state.applyPreset);

  return {
    roomMaterials,
    updateSurfaceMaterial,
    setSurfaceColor,
    setSurfaceTexture,
    updateMaterialProperties,
    resetToDefaults,
    applyPreset,
  };
};