// app/designer/components/builders/base-cabinet.tsx
"use client";
import { Box } from "@react-three/drei";
import type { RenderableModule } from "../../../../../core/types";
import { useMemo } from "react";
import * as THREE from "three";
import { Carcass } from "./carcass";
import { AnimatedDoor, DoubleDoor } from "./animated-door";
import { AnimatedDrawer } from "./animated-drawer";
import { FACADE_GAP } from "./constants";
import { useCabinetMaterial } from "./useCabinetMaterial";
import { useShaderMaterialFromDefinition } from "./useShaderMaterial";

/**
 * NOTE: This component uses the declarative @react-three/drei approach.
 *
 * For an alternative implementation using the geometry-generator utilities,
 * see: geometry-based-cabinet.tsx
 *
 * The geometry-generator provides:
 * - Framework-agnostic geometry generation
 * - Better performance for complex scenes
 * - More control over memory management
 * - Reusable geometry helpers
 *
 * Example usage:
 * import { GeometryBasedCabinet } from './geometry-based-cabinet';
 * <GeometryBasedCabinet module={module} interactive={true} />
 */

// Legacy Door component - replaced by AnimatedDoor

interface ShelfProps {
  width: number;
  depth: number;
  position: [number, number, number];
  color: string;
}

const Shelf = ({ width, depth, position, color }: ShelfProps) => (
  <Box position={position} args={[width, 1, depth]}>
    <meshStandardMaterial color={color} />
  </Box>
);

// Главный компонент-строитель
export const BaseCabinet = ({ module }: { module: RenderableModule }) => {
  // Load materials at top level (Hook rules)
  // Memory: Hooks must be called at top level of component
  const shaderMaterial = useShaderMaterialFromDefinition(
    module.materials?.facade
  );
  const standardMaterial = useCabinetMaterial(module.materials?.facade);
  const useShaderFacades = true; // temporary: force MeshStandardMaterial so we can isolate shader issues

  // Use shader material if available, otherwise fall back to standard material
  // Memoize to prevent infinite loops from async material updates
  // Important: Must have a fallback color to ensure rendering doesn't block on undefined materials
  const facadeMaterial = useMemo(() => {
    const fallback =
      standardMaterial ||
      new THREE.MeshStandardMaterial({
        color: module.materials?.facade?.color || "#8B7355",
      });
    if (useShaderFacades) {
      return (shaderMaterial as THREE.Material | null) || fallback;
    }
    return fallback;
  }, [
    shaderMaterial,
    standardMaterial,
    module.materials?.facade?.color,
    useShaderFacades,
  ]);

  // Создаем материалы один раз для оптимизации
  const carcassMaterial = useMemo(
    () => <meshStandardMaterial color="#CCCCCC" />,
    []
  );

  // Генерируем внутренние элементы на основе структуры
  const internalElements = useMemo(() => {
    // Check if module has structure and carcass properties
    const structure = module.structure;
    const carcass = module.carcass;

    if (!structure || !carcass) return null;

    const carcassThickness = carcass.thickness || 1.8;
    const internalWidth = module.dimensions.width - carcassThickness * 2;
    const internalDepth = module.dimensions.depth - carcassThickness;

    if (structure.type === "drawers") {
      const elements = [];
      const availableHeight = module.dimensions.height - carcassThickness * 2;
      const totalDrawerHeight = structure.drawerHeights.reduce(
        (sum, h) => sum + h,
        0
      );
      const totalGapHeight = FACADE_GAP * (structure.count - 1); // Зазоры только между ящиками
      const scaleFactor =
        (availableHeight - totalGapHeight) / totalDrawerHeight;

      let currentY = carcassThickness; // Начинаем с дна

      for (let i = 0; i < structure.count; i++) {
        const scaledDrawerHeight = structure.drawerHeights[i] * scaleFactor;
        const isLastDrawer = i === structure.count - 1;
        // У последнего ящика нет зазора сверху, у остальных - есть
        const actualDrawerHeight = isLastDrawer
          ? scaledDrawerHeight
          : scaledDrawerHeight - FACADE_GAP;

        elements.push(
          <AnimatedDrawer
            key={i}
            width={internalWidth}
            height={actualDrawerHeight}
            depth={structure.internalDepth}
            position={[
              0,
              currentY + actualDrawerHeight / 2,
              (module.dimensions.depth - structure.internalDepth) / 2,
            ]}
            color="#8B4513" // Fallback color for drawers
            material={facadeMaterial}
          />
        );

        // Добавляем масштабированную высоту ящика (для промежуточных - зазор учтен в actualDrawerHeight)
        currentY += scaledDrawerHeight;
        // Добавляем зазор после ящика (кроме последнего)
        if (!isLastDrawer) {
          currentY += FACADE_GAP;
        }
      }
      return <>{elements}</>;
    }

    if (structure.type === "door-and-shelf") {
      const elements = [];

      // 1. Рисуем полку
      const shelfHeight = structure.shelves[0].positionFromBottom;
      elements.push(
        <Shelf
          key="shelf"
          width={internalWidth}
          depth={internalDepth - 1}
          position={[0, shelfHeight, 0]}
          color="#D2691E" // Цвет полки
        />
      );

      // 2. Рисуем анимированную дверцу
      const doorWidth = internalWidth;
      const doorHeight =
        module.dimensions.height - carcassThickness * 2 - FACADE_GAP * 2;
      const doorDepth = 1.5;

      // Determine if we need single or double door based on width
      const useDoubleDoor = doorWidth > 60; // Use double door for wide cabinets

      if (useDoubleDoor) {
        elements.push(
          <DoubleDoor
            key="double-door"
            width={doorWidth}
            height={doorHeight}
            depth={doorDepth}
            position={[
              0,
              carcassThickness + doorHeight / 2,
              (module.dimensions.depth - doorDepth) / 2,
            ]}
            color={module.materials.facade?.color || "#8B7355"}
            material={facadeMaterial}
            gap={0}
          />
        );
      } else {
        elements.push(
          <AnimatedDoor
            key="single-door"
            width={doorWidth}
            height={doorHeight}
            depth={doorDepth}
            position={[
              0,
              carcassThickness + doorHeight / 2,
              (module.dimensions.depth - doorDepth) / 2,
            ]}
            color={module.materials.facade?.color || "#8B7355"}
            material={facadeMaterial}
          />
        );
      }

      return <>{elements}</>;
    }

    return null;
  }, [module, facadeMaterial]);

  return (
    <group position={[module.position.x, module.position.y, module.position.z]}>
      {/* 1. Рисуем корпус из отдельных панелей */}
      <Carcass
        dimensions={module.dimensions}
        carcass={module.carcass}
        material={carcassMaterial}
      />

      {/* 2. Рисуем внутренние элементы (ящики, дверцы, полки) */}
      {internalElements}
    </group>
  );
};
