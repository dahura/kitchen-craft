// app/designer/components/builders/plinth.tsx
"use client";
import { Box } from "@react-three/drei";
import { useMemo } from "react";
import type { RenderableModule } from "../../../../../core/types";

interface PlinthProps {
  modules: RenderableModule[];
  plinthHeight: number;
  plinthDepth: number;
}

export const Plinth = ({ modules, plinthHeight, plinthDepth }: PlinthProps) => {
  // Группируем модули по линиям и позициям для создания непрерывного цоколя
  const plinthSegments = useMemo(() => {
    const segments: Array<{
      start: number;
      end: number;
      z: number;
      rotation: number;
    }> = [];

    // Группируем модули по rotation и z позиции
    const groupedModules = modules.reduce(
      (groups, module) => {
        const key = `${module.rotation.y}_${module.position.z}`;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(module);
        return groups;
      },
      {} as Record<string, RenderableModule[]>,
    );

    // Создаем сегменты цоколя для каждой группы
    Object.values(groupedModules).forEach((group) => {
      if (group.length === 0) return;

      // Сортируем модули по позиции X
      const sortedModules = group.sort((a, b) => a.position.x - b.position.x);

      const rotation = sortedModules[0].rotation.y;
      const z = sortedModules[0].position.z;

      let currentStart =
        sortedModules[0].position.x - sortedModules[0].dimensions.width / 2;
      let currentEnd =
        sortedModules[0].position.x + sortedModules[0].dimensions.width / 2;

      for (let i = 1; i < sortedModules.length; i++) {
        const module = sortedModules[i];
        const moduleStart = module.position.x - module.dimensions.width / 2;
        const moduleEnd = module.position.x + module.dimensions.width / 2;

        // Если модуль находится рядом с текущим сегментом (с небольшим зазором)
        if (moduleStart <= currentEnd + 5) {
          // Расширяем текущий сегмент
          currentEnd = moduleEnd;
        } else {
          // Сохраняем текущий сегмент и начинаем новый
          segments.push({
            start: currentStart,
            end: currentEnd,
            z,
            rotation,
          });
          currentStart = moduleStart;
          currentEnd = moduleEnd;
        }
      }

      // Добавляем последний сегмент
      segments.push({
        start: currentStart,
        end: currentEnd,
        z,
        rotation,
      });
    });

    return segments;
  }, [modules]);

  const plinthMaterial = useMemo(
    () => <meshStandardMaterial color="#2C3E50" roughness={0.8} />,
    [],
  );

  return (
    <group>
      {plinthSegments.map((segment, index) => {
        const width = segment.end - segment.start;
        const centerX = (segment.start + segment.end) / 2;

        return (
          <Box
            key={`plinth-${segment.start}-${segment.end}-${segment.z}-${segment.rotation}`}
            args={[width, plinthHeight, plinthDepth]}
            position={[centerX, plinthHeight / 2, segment.z]}
            rotation={[0, (segment.rotation * Math.PI) / 180, 0]}
          >
            {plinthMaterial}
          </Box>
        );
      })}
    </group>
  );
};
