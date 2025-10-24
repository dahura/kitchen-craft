// app/designer/hooks/useViewportCamera.ts
import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import {
  calculateOptimalCameraPosition,
  calculateCameraSafeZone,
  sphericalToCartesian,
  constrainSphericalCoordinates,
} from "../utils/room-boundary-calculator";
import type {
  Position,
  CameraSafeZone,
} from "../utils/room-boundary-calculator";

/**
 * Интерфейс для настроек камеры
 */
export interface CameraSettings {
  position: Position;
  target: Position;
  fov: number;
  near: number;
  far: number;
  safeZone: CameraSafeZone;
}

/**
 * Интерфейс для хука useViewportCamera
 */
export interface UseViewportCameraProps {
  roomWidth: number;
  roomDepth: number;
  roomHeight: number;
  initialFov?: number;
  enableAdaptation?: boolean;
}

/**
 * Хук для адаптации камеры под размер экрана
 */
export function useViewportCamera({
  roomWidth,
  roomDepth,
  roomHeight,
  initialFov = 45,
  enableAdaptation = true,
}: UseViewportCameraProps): CameraSettings & { aspectRatio: number } {
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [cameraSettings, setCameraSettings] = useState<CameraSettings>(() => {
    const { position, target } = calculateOptimalCameraPosition(
      roomWidth,
      roomDepth,
      roomHeight,
      16 / 9,
    );

    return {
      position,
      target,
      fov: initialFov,
      near: 1,
      far: 2000,
      safeZone: calculateCameraSafeZone(roomWidth, roomDepth, roomHeight),
    };
  });

  const previousDimensionsRef = useRef({ roomWidth, roomDepth, roomHeight });

  // Эффект для отслеживания изменения размеров окна
  useEffect(() => {
    if (!enableAdaptation) return;

    const handleResize = () => {
      const newAspectRatio = window.innerWidth / window.innerHeight;
      setAspectRatio(newAspectRatio);
    };

    // Устанавливаем начальное значение
    handleResize();

    // Добавляем слушатель событий
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [enableAdaptation]);

  // Эффект для обновления настроек камеры при изменении размеров комнаты или аспект-рейтио
  useEffect(() => {
    if (!enableAdaptation) return;

    const {
      roomWidth: prevWidth,
      roomDepth: prevDepth,
      roomHeight: prevHeight,
    } = previousDimensionsRef.current;

    // Проверяем, изменились ли размеры комнаты
    if (
      roomWidth !== prevWidth ||
      roomDepth !== prevDepth ||
      roomHeight !== prevHeight
    ) {
      previousDimensionsRef.current = { roomWidth, roomDepth, roomHeight };

      // Вычисляем новые оптимальные позиции
      const { position, target } = calculateOptimalCameraPosition(
        roomWidth,
        roomDepth,
        roomHeight,
        aspectRatio,
      );

      // Адаптируем FOV на основе аспект-рейтио
      let adaptedFov = initialFov;

      if (aspectRatio < 1) {
        // Портретная ориентация - увеличиваем FOV
        adaptedFov = initialFov * 1.2;
      } else if (aspectRatio > 2) {
        // Очень широкая - уменьшаем FOV
        adaptedFov = initialFov * 0.8;
      }

      setCameraSettings({
        position,
        target,
        fov: adaptedFov,
        near: 1,
        far: Math.max(roomWidth, roomDepth, roomHeight) * 3,
        safeZone: calculateCameraSafeZone(roomWidth, roomDepth, roomHeight),
      });
    }
  }, [
    roomWidth,
    roomDepth,
    roomHeight,
    aspectRatio,
    initialFov,
    enableAdaptation,
  ]);

  // Эффект для адаптации FOV при изменении аспект-рейтио
  useEffect(() => {
    if (!enableAdaptation) return;

    let adaptedFov = initialFov;

    if (aspectRatio < 1) {
      // Портретная ориентация - увеличиваем FOV
      adaptedFov = initialFov * 1.2;
    } else if (aspectRatio > 2) {
      // Очень широкая - уменьшаем FOV
      adaptedFov = initialFov * 0.8;
    }

    setCameraSettings((prev) => ({
      ...prev,
      fov: adaptedFov,
    }));
  }, [aspectRatio, initialFov, enableAdaptation]);

  return {
    ...cameraSettings,
    aspectRatio,
  };
}

/**
 * Хук для управления позицией камеры в сферических координатах
 */
export function useSphericalCamera(initialSettings: {
  radius: number;
  polarAngle: number;
  azimuthAngle: number;
  target: Position;
  safeZone: CameraSafeZone;
}) {
  const [sphericalCoords, setSphericalCoords] = useState({
    radius: initialSettings.radius,
    polarAngle: initialSettings.polarAngle,
    azimuthAngle: initialSettings.azimuthAngle,
  });

  const [target, setTarget] = useState(initialSettings.target);

  // Обновление сферических координат с ограничениями
  const updateSphericalCoords = (
    radius: number,
    polarAngle: number,
    azimuthAngle: number,
  ) => {
    const constrained = constrainSphericalCoordinates(
      radius,
      polarAngle,
      azimuthAngle,
      initialSettings.safeZone,
    );

    setSphericalCoords(constrained);
  };

  // Получение декартовых координат
  const getCartesianPosition = (): Position => {
    return sphericalToCartesian(
      sphericalCoords.radius,
      sphericalCoords.polarAngle,
      sphericalCoords.azimuthAngle,
      target,
    );
  };

  return {
    sphericalCoords,
    target,
    updateSphericalCoords,
    setTarget,
    getCartesianPosition,
  };
}

/**
 * Хук для плавной анимации камеры
 */
export function useCameraAnimation(
  fromPosition: Position,
  toPosition: Position,
  duration: number = 1000,
) {
  const [currentPosition, setCurrentPosition] = useState(fromPosition);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | undefined>();

  const animate = (startPos: Position, endPos: Position, duration: number) => {
    setIsAnimating(true);
    const startTime = Date.now();

    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animateFrame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      const newPosition: Position = {
        x: startPos.x + (endPos.x - startPos.x) * easedProgress,
        y: startPos.y + (endPos.y - startPos.y) * easedProgress,
        z: startPos.z + (endPos.z - startPos.z) * easedProgress,
      };

      setCurrentPosition(newPosition);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateFrame);
      } else {
        setIsAnimating(false);
      }
    };

    animateFrame();
  };

  const startAnimation = (targetPosition: Position) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animate(currentPosition, targetPosition, duration);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    currentPosition,
    isAnimating,
    startAnimation,
  };
}
