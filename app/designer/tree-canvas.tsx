// app/designer/three-canvas.tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box } from "@react-three/drei";
import * as THREE from "three";

import { BaseCabinet } from "./components/builders/base-cabinet";
import { Plinth } from "./components/builders/plinth";
import { Room } from "./components/room";
import {
  MainLight,
  AmbientLight,
  FillLight,
  KitchenAccentLight,
} from "./components/scene-lighting";
import { useKitchenStore } from "../lib/store/kitchen-store";

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
  const { renderableModules, currentConfig } = useKitchenStore();

  // Фильтруем только напольные модули для цоколя
  const baseModules = renderableModules.filter(
    (module) => module.type === "base" || module.type === "sink",
  );

  // Получаем настройки цоколя из конфигурации
  const { plinthHeight, plinthDepth } = currentConfig.globalSettings.dimensions;

  // Размеры комнаты на основе конфигурации кухни
  const roomWidth =
    (currentConfig.globalSettings.dimensions.sideA || 300) + 200;
  const roomDepth =
    (currentConfig.globalSettings.dimensions.sideB || 200) + 200;
  const roomHeight = currentConfig.globalSettings.dimensions.height + 50;

  return (
    <>
      {/* Освещение */}
      <AmbientLight />
      <MainLight />
      <FillLight />
      <KitchenAccentLight />

      {/* Комната */}
      <Room
        roomWidth={roomWidth}
        roomDepth={roomDepth}
        roomHeight={roomHeight}
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
            return <BaseCabinet key={module.id} module={module} />;
          default:
            return <DefaultModule key={module.id} {...module} />;
        }
      })}
    </>
  );
};

export default function ThreeCanvas() {
  return (
    <Canvas
      shadows // Включаем тени для всей сцены
      camera={{
        position: [600, 400, 600], // Позиция камеры [x, y, z]
        fov: 45, // Угол обзия
      }}
      style={{ width: "100%", height: "100%" }}
      // Устанавливаем светлый фон вместо черного
      scene={{ background: new THREE.Color("#F8F8F8") }}
    >
      <SceneContent />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        target={[150, 0, -50]} // Точка, вокруг которой вращается камера (приблизительно центр кухни)
        minDistance={100} // Минимальное расстояние зума
        maxDistance={2000} // Максимальное расстояние зума
      />
    </Canvas>
  );
}
