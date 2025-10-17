// app/designer/components/builders/base-cabinet.tsx
"use client";
import { Box } from "@react-three/drei";
import { RenderableModule } from "../../../../core/types";
import { useMemo } from "react";
import { Carcass } from "./carcass";

// Вспомогательные компоненты для отрисовки внутренних частей
interface DrawerProps {
  width: number;
  height: number;
  depth: number;
  position: [number, number, number];
  color: string;
}

const Drawer = ({ width, height, depth, position, color }: DrawerProps) => (
  <Box position={position} args={[width, height, depth]}>
    <meshStandardMaterial color={color} />
  </Box>
);

interface DoorProps {
  width: number;
  height: number;
  depth: number;
  position: [number, number, number];
  color: string;
}

const Door = ({ width, height, depth, position, color }: DoorProps) => (
  <Box position={position} args={[width, height, depth]}>
    <meshStandardMaterial color={color} />
  </Box>
);

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
  // Создаем материалы один раз для оптимизации
  const carcassMaterial = useMemo(
    () => <meshStandardMaterial color="#CCCCCC" />,
    [],
  );
  const facadeMaterial = useMemo(
    () => (
      <meshStandardMaterial
        color={module.materials.facade?.color || "lightblue"}
      />
    ),
    [module.materials.facade?.color],
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
      let currentY = carcassThickness; // Начинаем с дна

      for (let i = 0; i < structure.count; i++) {
        const drawerHeight = structure.drawerHeights[i];
        elements.push(
          <Drawer
            key={i}
            width={internalWidth - 2} // Небольшой зазор по бокам
            height={drawerHeight - 2} // Небольшой зазор сверху
            depth={structure.internalDepth}
            position={[
              0,
              currentY + drawerHeight / 2,
              (module.dimensions.depth - structure.internalDepth) / 2,
            ]}
            color="#8B4513" // Цвет ящиков
          />,
        );
        currentY += drawerHeight + 1; // Прибавляем высоту ящика и зазор
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
          width={internalWidth - 2}
          depth={internalDepth - 1}
          position={[0, shelfHeight, 0]}
          color="#D2691E" // Цвет полки
        />,
      );

      // 2. Рисуем дверцу
      const doorWidth = internalWidth - 2;
      const doorHeight = module.dimensions.height - carcassThickness * 2 - 2;
      const doorDepth = 1.5;

      elements.push(
        <Door
          key="door"
          width={doorWidth}
          height={doorHeight}
          depth={doorDepth}
          position={[
            0,
            carcassThickness + doorHeight / 2,
            (module.dimensions.depth - doorDepth) / 2,
          ]}
          color={facadeMaterial.props.color} // Используем цвет фасада
        />,
      );

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
