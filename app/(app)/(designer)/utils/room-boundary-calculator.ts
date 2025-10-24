// app/designer/utils/room-boundary-calculator.ts
import * as THREE from "three";
import type { Position, Dimensions } from "@/core/types";

// Экспортируем типы для использования в других модулях
export type { Position, Dimensions };

/**
 * Интерфейс для описания границ комнаты
 */
export interface RoomBoundaries {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

/**
 * Интерфейс для описания безопасной зоны камеры
 */
export interface CameraSafeZone {
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  minAzimuthAngle: number;
  maxAzimuthAngle: number;
}

/**
 * Вычисляет границы комнаты на основе ее размеров
 */
export function calculateRoomBoundaries(
  roomWidth: number,
  roomDepth: number,
  roomHeight: number,
): RoomBoundaries {
  return {
    minX: 0,
    maxX: roomWidth,
    minY: 0,
    maxY: roomHeight,
    minZ: -roomDepth,
    maxZ: 0,
  };
}

/**
 * Проверяет, находится ли позиция внутри границ комнаты
 */
export function isPositionInsideRoom(
  position: Position,
  boundaries: RoomBoundaries,
  margin: number = 10, // Запас от границ в см
): boolean {
  return (
    position.x >= boundaries.minX + margin &&
    position.x <= boundaries.maxX - margin &&
    position.y >= boundaries.minY + margin &&
    position.y <= boundaries.maxY - margin &&
    position.z >= boundaries.minZ + margin &&
    position.z <= boundaries.maxZ - margin
  );
}

/**
 * Ограничивает позицию камеры в пределах комнаты
 */
export function constrainCameraPosition(
  position: Position,
  boundaries: RoomBoundaries,
  margin: number = 50,
): Position {
  return {
    x: Math.max(
      boundaries.minX + margin,
      Math.min(boundaries.maxX - margin, position.x),
    ),
    y: Math.max(
      boundaries.minY + margin,
      Math.min(boundaries.maxY - margin, position.y),
    ),
    z: Math.max(
      boundaries.minZ + margin,
      Math.min(boundaries.maxZ - margin, position.z),
    ),
  };
}

/**
 * Вычисляет безопасную зону для камеры на основе размеров комнаты
 */
export function calculateCameraSafeZone(
  roomWidth: number,
  roomDepth: number,
  roomHeight: number,
): CameraSafeZone {
  const maxDimension = Math.max(roomWidth, roomDepth, roomHeight);

  return {
    minDistance: maxDimension * 0.3,
    maxDistance: maxDimension * 2.5, // Увеличиваем для большего отдаления
    minPolarAngle: 0, // Разрешаем полный оборот по вертикали (снизу)
    maxPolarAngle: Math.PI, // Разрешаем полный оборот по вертикали (сверху)
    minAzimuthAngle: -Math.PI, // -180 градусов (полный круг)
    maxAzimuthAngle: Math.PI, // +180 градусов (полный круг)
  };
}

/**
 * Вычисляет оптимальную позицию камеры для обзора комнаты
 */
export function calculateOptimalCameraPosition(
  roomWidth: number,
  roomDepth: number,
  roomHeight: number,
  aspectRatio: number = 16 / 9,
): { position: Position; target: Position } {
  const centerX = roomWidth / 2;
  const centerY = roomHeight / 2;
  const centerZ = -roomDepth / 2;

  // Вычисляем дистанцию на основе размеров комнаты и соотношения сторон
  const baseDistance = Math.max(roomWidth, roomDepth) * 1.2; // Увеличиваем базовую дистанцию
  const aspectRatioAdjustment = aspectRatio > 1 ? 1.5 : 1.2; // Увеличиваем корректировку
  const cameraDistance = baseDistance * aspectRatioAdjustment;

  // Позиция камеры: сверху и сбоку для лучшего обзора
  const position: Position = {
    x: centerX + cameraDistance * 0.6,
    y: roomHeight * 0.7 + cameraDistance * 0.3,
    z: centerZ + cameraDistance * 0.6,
  };

  const target: Position = {
    x: centerX,
    y: centerY,
    z: centerZ,
  };

  return { position, target };
}

/**
 * Преобразует сферические координаты в декартовы
 */
export function sphericalToCartesian(
  radius: number,
  polarAngle: number,
  azimuthAngle: number,
  target: Position,
): Position {
  const x = target.x + radius * Math.sin(polarAngle) * Math.cos(azimuthAngle);
  const y = target.y + radius * Math.cos(polarAngle);
  const z = target.z + radius * Math.sin(polarAngle) * Math.sin(azimuthAngle);

  return { x, y, z };
}

/**
 * Проверяет и ограничивает сферические координаты камеры
 */
export function constrainSphericalCoordinates(
  radius: number,
  polarAngle: number,
  azimuthAngle: number,
  safeZone: CameraSafeZone,
): { radius: number; polarAngle: number; azimuthAngle: number } {
  return {
    radius: Math.max(
      safeZone.minDistance,
      Math.min(safeZone.maxDistance, radius),
    ),
    polarAngle: Math.max(
      safeZone.minPolarAngle,
      Math.min(safeZone.maxPolarAngle, polarAngle),
    ),
    azimuthAngle: Math.max(
      safeZone.minAzimuthAngle,
      Math.min(safeZone.maxAzimuthAngle, azimuthAngle),
    ),
  };
}

/**
 * Вычисляет bounding box для группы модулей
 */
export function calculateKitchenBoundingBox(
  modules: Array<{ position: Position; dimensions: Dimensions }>,
): { min: Position; max: Position; center: Position } {
  if (modules.length === 0) {
    return {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 },
      center: { x: 0, y: 0, z: 0 },
    };
  }

  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity;

  modules.forEach((module) => {
    const halfWidth = module.dimensions.width / 2;
    const halfHeight = module.dimensions.height / 2;
    const halfDepth = module.dimensions.depth / 2;

    minX = Math.min(minX, module.position.x - halfWidth);
    maxX = Math.max(maxX, module.position.x + halfWidth);
    minY = Math.min(minY, module.position.y);
    maxY = Math.max(maxY, module.position.y + halfHeight);
    minZ = Math.min(minZ, module.position.z - halfDepth);
    maxZ = Math.max(maxZ, module.position.z + halfDepth);
  });

  const center: Position = {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
    z: (minZ + maxZ) / 2,
  };

  return {
    min: { x: minX, y: minY, z: minZ },
    max: { x: maxX, y: maxY, z: maxZ },
    center,
  };
}
