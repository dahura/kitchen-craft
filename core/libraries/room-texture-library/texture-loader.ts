// texture-loader.ts
import * as THREE from "three";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";

import type { RoomTextureSet } from "../../types";

// Кеширование загруженных текстур
const textureCache = new Map<string, THREE.Texture>();
const textureLoader = new THREE.TextureLoader();
const exrLoader = new EXRLoader();

/**
 * Загружает отдельную текстуру с кешированием
 * Поддерживает обычные форматы (JPG, PNG) через TextureLoader
 * и EXR формат через EXRLoader
 */
export const loadTexture = (url: string): Promise<THREE.Texture> => {
  return new Promise((resolve, reject) => {
    // Проверяем кеш
    const cachedTexture = textureCache.get(url);
    if (cachedTexture) {
      resolve(cachedTexture);
      return;
    }

    // Определяем тип текстуры по расширению
    const isEXR = url.toLowerCase().endsWith(".exr");

    if (isEXR) {
      // Загружаем EXR текстуру
      exrLoader.load(
        url,
        (texture) => {
          // Настройки для оптимизации
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          // EXR файлы обычно уже в линейном цветовом пространстве
          texture.colorSpace = THREE.LinearSRGBColorSpace;

          // Кешируем
          textureCache.set(url, texture);
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error(`Failed to load EXR texture: ${url}`, error);
          reject(error);
        }
      );
    } else {
      // Загружаем обычную текстуру (JPG, PNG и т.д.)
      textureLoader.load(
        url,
        (texture) => {
          // Настройки для оптимизации
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.colorSpace = THREE.SRGBColorSpace;

          // Кешируем
          textureCache.set(url, texture);
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error(`Failed to load texture: ${url}`, error);
          reject(error);
        }
      );
    }
  });
};

/**
 * Загружает набор PBR текстур для поверхности
 */
export const loadTextureSet = async (
  textureSet: RoomTextureSet,
  basePath: string = ""
): Promise<THREE.MeshStandardMaterial> => {
  console.log("Loading texture set:", { textureSet, basePath });

  const materialProps: Partial<THREE.MeshStandardMaterialParameters> = {
    side: THREE.DoubleSide,
  };

  try {
    // Загружаем диффузную карту
    if (textureSet.diffuse) {
      const diffuseUrl = basePath + textureSet.diffuse;
      console.log("Loading diffuse texture:", diffuseUrl);
      materialProps.map = await loadTexture(diffuseUrl);
    }

    // Загружаем карту нормалей
    if (textureSet.normal) {
      const normalUrl = basePath + textureSet.normal;
      console.log("Loading normal texture:", normalUrl);
      materialProps.normalMap = await loadTexture(normalUrl);
    }

    // Загружаем карту шероховатости
    if (textureSet.roughness) {
      const roughnessUrl = basePath + textureSet.roughness;
      console.log("Loading roughness texture:", roughnessUrl);
      materialProps.roughnessMap = await loadTexture(roughnessUrl);
    }

    // Загружаем карту смещения
    if (textureSet.displacement) {
      const displacementUrl = basePath + textureSet.displacement;
      console.log("Loading displacement texture:", displacementUrl);
      materialProps.displacementMap = await loadTexture(displacementUrl);
    }

    // Загружаем карту окружающего затенения
    if (textureSet.ambientOcclusion) {
      const aoUrl = basePath + textureSet.ambientOcclusion;
      materialProps.aoMap = await loadTexture(aoUrl);
    }
  } catch (error) {
    console.error("Failed to load texture set:", error);
    // Возвращаем базовый материал в случае ошибки
    return new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      side: THREE.DoubleSide,
    });
  }

  return new THREE.MeshStandardMaterial(materialProps);
};

/**
 * Создает материал на основе цвета
 */
export const createColorMaterial = (
  color: string,
  roughness: number = 0.8,
  metalness: number = 0.0
): THREE.MeshStandardMaterial => {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness,
    side: THREE.DoubleSide,
  });
};

/**
 * Очищает кеш текстур
 */
export const clearTextureCache = (): void => {
  textureCache.forEach((texture) => {
    texture.dispose();
  });
  textureCache.clear();
};

/**
 * Предзагружает набор текстур
 */
export const preloadTextures = async (
  textureSets: RoomTextureSet[],
  basePath: string = ""
): Promise<void> => {
  const loadPromises: Promise<void>[] = [];

  textureSets.forEach((textureSet) => {
    Object.values(textureSet).forEach((textureUrl) => {
      if (textureUrl) {
        loadPromises.push(
          loadTexture(basePath + textureUrl).then(() => {
            // Текстура загружена и закеширована
          })
        );
      }
    });
  });

  await Promise.all(loadPromises);
};
