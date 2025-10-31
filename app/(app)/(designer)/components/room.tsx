// app/designer/components/room.tsx
"use client";
import { Plane, Box, Line } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { useRoomMaterials } from "../hooks/useRoomMaterials";

interface RoomProps {
  roomWidth: number;
  roomDepth: number;
  roomHeight: number;
}

export const Room = ({ roomWidth, roomDepth, roomHeight }: RoomProps) => {
  // Используем новый хук для управления материалами комнаты
  const { materials, isLoading } = useRoomMaterials();

  // Линии для обозначения границ комнаты
  const boundaryLines = useMemo(() => {
    const points = [
      [0, 0.1, 0], // Начало координат (немного выше пола)
      [roomWidth, 0.1, 0], // Правый угол
      [roomWidth, 0.1, -roomDepth], // Дальний правый угол
      [0, 0.1, -roomDepth], // Дальний левый угол
      [0, 0.1, 0], // Замыкаем прямоугольник
    ];

    return points.map((point) => new THREE.Vector3(...point));
  }, [roomWidth, roomDepth]);

  return (
    <group>
      {/* Пол */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[roomWidth / 2, 0, -roomDepth / 2]}
        receiveShadow
      >
        <planeGeometry args={[roomWidth, roomDepth]} />
        {materials.floor ? <primitive object={materials.floor} /> : null}
      </mesh>

      {/* Задняя стена */}
      <mesh
        position={[roomWidth / 2, roomHeight / 2, -roomDepth]}
        receiveShadow
      >
        <planeGeometry args={[roomWidth, roomHeight]} />
        {materials.walls ? <primitive object={materials.walls} /> : null}
      </mesh>

      {/* Левая боковая стена */}
      <mesh
        position={[0, roomHeight / 2, -roomDepth / 2]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[roomDepth, roomHeight]} />
        {materials.walls ? <primitive object={materials.walls} /> : null}
      </mesh>

      {/* Правая боковая стена */}
      <mesh
        position={[roomWidth, roomHeight / 2, -roomDepth / 2]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[roomDepth, roomHeight]} />
        {materials.walls ? <primitive object={materials.walls} /> : null}
      </mesh>

      {/* Передняя стена */}
      <mesh position={[roomWidth / 2, roomHeight / 2, 0]} receiveShadow>
        <planeGeometry args={[roomWidth, roomHeight]} />
        {materials.walls ? <primitive object={materials.walls} /> : null}
      </mesh>

      {/* Потолок */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[roomWidth / 2, roomHeight, -roomDepth / 2]}
        receiveShadow
      >
        <planeGeometry args={[roomWidth, roomDepth]} />
        {materials.ceiling ? <primitive object={materials.ceiling} /> : null}
      </mesh>

      {/* Границы комнаты (тонкие линии на полу) */}
      <Line
        points={boundaryLines}
        color="#888888"
        lineWidth={2}
        opacity={0.5}
        transparent
      />
    </group>
  );
};
