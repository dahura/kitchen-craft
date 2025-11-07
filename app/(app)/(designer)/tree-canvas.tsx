// app/designer/three-canvas.tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { Box } from "@react-three/drei";
import * as THREE from "three";

import { BaseCabinet } from "./components/builders/base-cabinet";
import { UpperCabinet } from "./components/builders/upper-cabinet";
import { TallCabinet } from "./components/builders/tall-cabinet";
import { Plinth } from "./components/builders/plinth";
import { Room } from "./components/room";
import { RoomMaterialsPanel } from "./components/room-materials-panel";
import {
  MainLight,
  AmbientLight,
  FillLight,
  KitchenAccentLight,
  WallLight,
} from "./components/scene-lighting";
import { useKitchenStore } from "../../lib/store/kitchen-store";
import { useMemo, useState } from "react";
import { useViewportCamera } from "./hooks/useViewportCamera";
import { BoundedOrbitControls } from "./components/bounded-orbit-controls";
import {
  calculateRoomBoundaries,
  calculateCameraSafeZone,
} from "./utils/room-boundary-calculator";
import { generateWithCentering } from "../../../core/engines/layout-engine/layout-engine";
import { materialLibrary } from "../../../core/libraries/material-library/material-library";

// Компонент-заглушка
const DefaultModule = (props: any) => (
  <Box
    args={[
      props.dimensions.width,
      props.dimensions.height,
      props.dimensions.depth,
    ]}
    position={[props.position.x, props.position.y, props.position.z]}
  >
    <meshStandardMaterial color="gray" />
  </Box>
);

// Главный компонент сцены
export const SceneContent = () => {
  const { currentConfig } = useKitchenStore();
  const [boundaryHit, setBoundaryHit] = useState<string | null>(null);

  // Генерируем модули с центрированием
  const renderableModules = useMemo(() => {
    // Вычисляем размеры комнаты для центрирования
    const sideA = currentConfig.globalSettings.dimensions.sideA || 300;
    const sideB = currentConfig.globalSettings.dimensions.sideB || 200;
    const height = currentConfig.globalSettings.dimensions.height;
    const margin = 600; // Такой же margin как для комнаты

    // Центр увеличенной комнаты
    const roomCenter = {
      x: sideA / 2 + margin,
      y: height / 2,
      z: -sideB / 2 - margin,
    };

    return generateWithCentering(currentConfig, materialLibrary, {
      enabled: true, // Включаем центрирование
      offsetX: roomCenter.x - sideA / 2, // Смещаем к центру увеличенной комнаты
      offsetY: 0,
      offsetZ: roomCenter.z - -sideB / 2, // Смещаем к центру увеличенной комнаты
      maintainRelativePositions: true,
    });
  }, [currentConfig]);

  // Фильтруем только напольные модули для цоколя
  const baseModules = renderableModules.filter(
    (module) =>
      module.type === "base" ||
      module.type === "sink" ||
      module.type === "tall",
  );

  // Получаем настройки цоколя из конфигурации
  const { plinthHeight, plinthDepth } = currentConfig.globalSettings.dimensions;

  // Вычисляем размеры комнаты с запасом для комфортного обзора
  const roomDimensions = useMemo(() => {
    const sideA = currentConfig.globalSettings.dimensions.sideA || 300;
    const sideB = currentConfig.globalSettings.dimensions.sideB || 200;
    const height = currentConfig.globalSettings.dimensions.height;

    // Добавляем запас пространства вокруг кухни (увеличенный в 4 раза)
    const margin = 600; // 600cm запас с каждой стороны (в 4 раза больше)

    return {
      width: sideA + margin * 2,
      depth: sideB + margin * 2,
      height: height + 200, // 200cm запас сверху (в 2 раза больше)
      centerX: sideA / 2 + margin,
      centerZ: -sideB / 2 - margin,
      centerY: height / 2,
    };
  }, [currentConfig.globalSettings.dimensions]);

  // Вычисляем границы комнаты и безопасную зону для камеры
  const { roomBoundaries, cameraSafeZone } = useMemo(() => {
    const boundaries = calculateRoomBoundaries(
      roomDimensions.width,
      roomDimensions.depth,
      roomDimensions.height,
    );

    const safeZone = calculateCameraSafeZone(
      roomDimensions.width,
      roomDimensions.depth,
      roomDimensions.height,
    );

    return {
      roomBoundaries: boundaries,
      cameraSafeZone: safeZone,
    };
  }, [roomDimensions]);

  const handleBoundaryHit = (boundary: string) => {
    setBoundaryHit(boundary);
    setTimeout(() => setBoundaryHit(null), 1000);
  };

  return (
    <>
      {/* Освещение */}
      <AmbientLight />
      <MainLight />
      <FillLight />
      <KitchenAccentLight />
      <WallLight />

      {/* Комната */}
      <Room
        roomWidth={roomDimensions.width}
        roomDepth={roomDimensions.depth}
        roomHeight={roomDimensions.height}
      />

      {/* Цоколь */}
      <Plinth
        modules={baseModules}
        plinthHeight={plinthHeight}
        plinthDepth={plinthDepth}
      />

      {/* Модули кухни */}
      {renderableModules.map((module) => {
        switch (module.type) {
          case "base":
          case "sink":
            return <BaseCabinet key={module.id} module={module} />;
          case "upper":
          case "wall":
            return <UpperCabinet key={module.id} module={module} />;
          case "tall":
            return <TallCabinet key={module.id} module={module} />;
          default:
            return <DefaultModule key={module.id} {...module} />;
        }
      })}

      {/* Индикатор попадания в границу */}
      {boundaryHit && (
        <mesh
          position={[
            roomDimensions.width / 2,
            roomDimensions.height - 20,
            -roomDimensions.depth / 2,
          ]}
        >
          <boxGeometry args={[200, 10, 10]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )}
    </>
  );
};

export default function ThreeCanvas() {
  const { currentConfig } = useKitchenStore();

  // Вычисляем размеры комнаты
  const roomDimensions = useMemo(() => {
    const sideA = currentConfig.globalSettings.dimensions.sideA || 300;
    const sideB = currentConfig.globalSettings.dimensions.sideB || 200;
    const height = currentConfig.globalSettings.dimensions.height;

    const margin = 600; // Увеличенный в 4 раза запас пространства
    return {
      width: sideA + margin * 2,
      depth: sideB + margin * 2,
      height: height + 200, // Увеличенный запас высоты
    };
  }, [currentConfig.globalSettings.dimensions]);

  // Используем хук для адаптации камеры под размер экрана
  const cameraSettings = useViewportCamera({
    roomWidth: roomDimensions.width,
    roomDepth: roomDimensions.depth,
    roomHeight: roomDimensions.height,
    initialFov: 45,
    enableAdaptation: true,
  });

  // Вычисляем границы комнаты и безопасную зону для камеры
  const { roomBoundaries, cameraSafeZone } = useMemo(() => {
    const boundaries = calculateRoomBoundaries(
      roomDimensions.width,
      roomDimensions.depth,
      roomDimensions.height,
    );

    const safeZone = calculateCameraSafeZone(
      roomDimensions.width,
      roomDimensions.depth,
      roomDimensions.height,
    );

    return {
      roomBoundaries: boundaries,
      cameraSafeZone: safeZone,
    };
  }, [roomDimensions]);

  // Центр комнаты для target (центрированный на кухне)
  const cameraTarget = useMemo(() => {
    const sideA = currentConfig.globalSettings.dimensions.sideA || 300;
    const sideB = currentConfig.globalSettings.dimensions.sideB || 200;
    const height = currentConfig.globalSettings.dimensions.height;
    const margin = 600; // Такой же margin как для комнаты

    // Центр кухни в увеличенной комнате
    return [
      sideA / 2 + margin, // Центр кухни по X
      height / 2, // Центр кухни по Y
      -sideB / 2 - margin, // Центр кухни по Z
    ] as [number, number, number];
  }, [currentConfig]);

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        camera={{
          position: [
            cameraSettings.position.x,
            cameraSettings.position.y,
            cameraSettings.position.z,
          ] as [number, number, number],
          fov: cameraSettings.fov,
          near: cameraSettings.near,
          far: cameraSettings.far,
        }}
        className="w-full h-full"
        scene={{ background: new THREE.Color("#F8F8F8") }}
      >
        <SceneContent />

        <BoundedOrbitControls
          roomBoundaries={roomBoundaries}
          safeZone={cameraSafeZone}
          target={cameraTarget}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          enableDamping={true}
          dampingFactor={0.05}
          onBoundaryHit={(boundary) => {
            console.log(`Camera hit boundary: ${boundary}`);
          }}
        />
      </Canvas>

      {/* Панель управления материалами комнаты */}
      <RoomMaterialsPanel />
    </div>
  );
}
