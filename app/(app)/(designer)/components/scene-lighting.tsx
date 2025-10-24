// app/designer/components/scene-lighting.tsx
"use client";
import { useHelper } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

// Компонент для основного, направленного света (как солнце из окна)
export const MainLight = () => {
  const lightRef = useRef<THREE.DirectionalLight>(null);

  return (
    <directionalLight
      ref={lightRef}
      position={[500, 400, 300]} // Позиция источника света (симулируем свет из окна)
      intensity={1.2} // Мягкая интенсивность
      castShadow
      shadow-mapSize-width={4096} // Улучшенное качество теней
      shadow-mapSize-height={4096}
      shadow-camera-far={2000}
      shadow-camera-left={-500}
      shadow-camera-right={500}
      shadow-camera-top={500}
      shadow-camera-bottom={-500}
      color="#FFF8E7" // Теплый дневной свет
    />
  );
};

// Компонент для фонового, рассеянного света
export const AmbientLight = () => {
  return <ambientLight intensity={0.4} color="#F5F5F5" />; // Мягкий теплый свет
};

// Новый компонент для заполняющего света (уменьшает резкие тени)
export const FillLight = () => {
  return (
    <pointLight
      position={[-200, 200, -200]}
      intensity={0.3}
      color="#FFE4B5" // Теплый заполняющий свет
    />
  );
};

// Новый компонент для акцентного света над кухней
export const KitchenAccentLight = () => {
  return (
    <spotLight
      position={[150, 300, -100]}
      angle={0.6}
      penumbra={0.5}
      intensity={0.5}
      castShadow
      color="#FFFFFF"
      target-position={[150, 0, -50]}
    />
  );
};

// Новый компонент для освещения стен
export const WallLight = () => {
  return (
    <>
      <pointLight position={[50, 150, -10]} intensity={0.2} color="#FFFFFF" />
      <pointLight position={[250, 150, -10]} intensity={0.2} color="#FFFFFF" />
      <pointLight position={[150, 150, -190]} intensity={0.2} color="#FFFFFF" />
    </>
  );
};
