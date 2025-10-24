// app/designer/components/bounded-orbit-controls.tsx
"use client";
import {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { OrbitControls } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  isPositionInsideRoom,
  constrainCameraPosition,
} from "../utils/room-boundary-calculator";
import type {
  RoomBoundaries,
  CameraSafeZone,
  Position,
} from "../utils/room-boundary-calculator";

/**
 * Интерфейс для BoundedOrbitControls
 */
export interface BoundedOrbitControlsProps {
  roomBoundaries: RoomBoundaries;
  safeZone: CameraSafeZone;
  target?: [number, number, number];
  enablePan?: boolean;
  enableZoom?: boolean;
  enableRotate?: boolean;
  enableDamping?: boolean;
  dampingFactor?: number;
  minDistance?: number;
  maxDistance?: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  minAzimuthAngle?: number;
  maxAzimuthAngle?: number;
  onBoundaryHit?: (boundary: string) => void;
}

/**
 * Интерфейс для ref компонента
 */
export interface BoundedOrbitControlsRef {
  reset: () => void;
  getTarget: () => THREE.Vector3;
  setTarget: (target: THREE.Vector3) => void;
  getPosition: () => THREE.Vector3;
  setPosition: (position: THREE.Vector3) => void;
  getDistance: () => number;
  setDistance: (distance: number) => void;
}

/**
 * Компонент OrbitControls с ограничениями границ комнаты
 */
export const BoundedOrbitControls = forwardRef<
  BoundedOrbitControlsRef,
  BoundedOrbitControlsProps
>(
  (
    {
      roomBoundaries,
      safeZone,
      target = [0, 0, 0],
      enablePan = true,
      enableZoom = true,
      enableRotate = true,
      enableDamping = true,
      dampingFactor = 0.05,
      minDistance,
      maxDistance,
      minPolarAngle,
      maxPolarAngle,
      minAzimuthAngle,
      maxAzimuthAngle,
      onBoundaryHit,
    },
    ref,
  ) => {
    const { camera } = useThree();
    const controlsRef = useRef<any>(undefined);
    const previousPositionRef = useRef<THREE.Vector3 | undefined>(undefined);
    const boundaryHitTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const [isConstrained, setIsConstrained] = useState(false);

    // Проверка границ комнаты
    const checkRoomBoundaries = (position: THREE.Vector3): THREE.Vector3 => {
      const pos: Position = {
        x: position.x,
        y: position.y,
        z: position.z,
      };

      // Проверяем, находится ли позиция в пределах комнаты
      if (!isPositionInsideRoom(pos, roomBoundaries, 50)) {
        // Ограничиваем позицию
        const constrainedPos = constrainCameraPosition(pos, roomBoundaries, 50);

        // Вызываем callback при попадании в границу
        if (onBoundaryHit) {
          // Определяем, какая граница была нарушена
          const boundary = getViolatedBoundary(pos, roomBoundaries);
          if (boundary) {
            // Debounce вызовы
            if (boundaryHitTimeoutRef.current) {
              clearTimeout(boundaryHitTimeoutRef.current);
            }
            boundaryHitTimeoutRef.current = setTimeout(() => {
              onBoundaryHit(boundary);
            }, 100);
          }
        }

        setIsConstrained(true);
        setTimeout(() => setIsConstrained(false), 200);

        return new THREE.Vector3(
          constrainedPos.x,
          constrainedPos.y,
          constrainedPos.z,
        );
      }

      return position;
    };

    // Определение нарушенной границы
    const getViolatedBoundary = (
      position: Position,
      boundaries: RoomBoundaries,
    ): string | null => {
      const margin = 50;

      if (position.x < boundaries.minX + margin) return "left";
      if (position.x > boundaries.maxX - margin) return "right";
      if (position.y < boundaries.minY + margin) return "floor";
      if (position.y > boundaries.maxY - margin) return "ceiling";
      if (position.z < boundaries.minZ + margin) return "back";
      if (position.z > boundaries.maxZ - margin) return "front";

      return null;
    };

    // Обновление в каждом кадре
    useFrame(() => {
      if (!controlsRef.current) return;

      // Сохраняем предыдущую позицию
      if (!previousPositionRef.current) {
        previousPositionRef.current = camera.position.clone();
      }

      // Проверяем границы комнаты
      const constrainedPosition = checkRoomBoundaries(camera.position);

      // Если позиция была изменена, применяем ее
      if (!constrainedPosition.equals(camera.position)) {
        camera.position.copy(constrainedPosition);

        // Обновляем дистанцию в контролах
        if (controlsRef.current.update) {
          controlsRef.current.update();
        }
      }

      previousPositionRef.current = camera.position.clone();
    });

    // Экспорт методов через ref
    useImperativeHandle(ref, () => ({
      reset: () => {
        if (controlsRef.current?.reset) {
          controlsRef.current.reset();
        }
      },
      getTarget: () => {
        return controlsRef.current?.target?.clone() || new THREE.Vector3();
      },
      setTarget: (target: THREE.Vector3) => {
        if (controlsRef.current?.setTarget) {
          controlsRef.current.setTarget(target);
        }
      },
      getPosition: () => {
        return camera.position.clone();
      },
      setPosition: (position: THREE.Vector3) => {
        const constrainedPosition = checkRoomBoundaries(position);
        camera.position.copy(constrainedPosition);
        if (controlsRef.current?.update) {
          controlsRef.current.update();
        }
      },
      getDistance: () => {
        if (controlsRef.current?.getDistance) {
          return controlsRef.current.getDistance();
        }
        return camera.position.distanceTo(
          controlsRef.current?.target || new THREE.Vector3(),
        );
      },
      setDistance: (distance: number) => {
        if (controlsRef.current) {
          const constrainedDistance = Math.max(
            controlsRef.current.minDistance || safeZone.minDistance,
            Math.min(
              controlsRef.current.maxDistance || safeZone.maxDistance,
              distance,
            ),
          );

          // Направляем камеру к цели на нужном расстоянии
          const direction = new THREE.Vector3();
          direction
            .subVectors(
              camera.position,
              controlsRef.current.target || new THREE.Vector3(),
            )
            .normalize();
          camera.position
            .copy(controlsRef.current.target || new THREE.Vector3())
            .add(direction.multiplyScalar(constrainedDistance));

          if (controlsRef.current.update) {
            controlsRef.current.update();
          }
        }
      },
    }));

    return (
      <OrbitControls
        ref={controlsRef}
        target={target}
        enablePan={enablePan}
        enableZoom={enableZoom}
        enableRotate={enableRotate}
        enableDamping={enableDamping}
        dampingFactor={dampingFactor}
        minDistance={minDistance ?? safeZone.minDistance}
        maxDistance={maxDistance ?? safeZone.maxDistance}
        minPolarAngle={minPolarAngle ?? safeZone.minPolarAngle}
        maxPolarAngle={maxPolarAngle ?? safeZone.maxPolarAngle}
        minAzimuthAngle={minAzimuthAngle ?? safeZone.minAzimuthAngle}
        maxAzimuthAngle={maxAzimuthAngle ?? safeZone.maxAzimuthAngle}
      />
    );
  },
);

BoundedOrbitControls.displayName = "BoundedOrbitControls";

/**
 * Хук для упрощенного использования BoundedOrbitControls
 */
export function useBoundedOrbitControls(
  roomBoundaries: RoomBoundaries,
  safeZone: CameraSafeZone,
  options?: Partial<BoundedOrbitControlsProps>,
) {
  const controlsRef = useRef<BoundedOrbitControlsRef>(null);
  const [boundaryHit, setBoundaryHit] = useState<string | null>(null);

  const handleBoundaryHit = (boundary: string) => {
    setBoundaryHit(boundary);
    setTimeout(() => setBoundaryHit(null), 1000); // Сбрасываем через 1 секунду
  };

  return {
    controlsRef,
    boundaryHit,
    BoundedOrbitControls: (
      props: Omit<
        BoundedOrbitControlsProps,
        "roomBoundaries" | "safeZone" | "onBoundaryHit"
      >,
    ) => (
      <BoundedOrbitControls
        ref={controlsRef}
        roomBoundaries={roomBoundaries}
        safeZone={safeZone}
        onBoundaryHit={handleBoundaryHit}
        {...options}
        {...props}
      />
    ),
  };
}
