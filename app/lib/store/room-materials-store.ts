// lib/store/room-materials-store.ts
import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { createDefaultRoomMaterials } from "@/core/types";
import type { RoomMaterials, RoomSurfaceMaterial } from "@/core/types";

// Определяем интерфейс хранилища материалов комнат
interface RoomMaterialsStore {
  // --- СОСТОЯНИЕ (STATE) ---
  currentMaterials: RoomMaterials;
  isLoading: boolean;

  // --- ЭКШЕНЫ (ACTIONS) ---
  // Обновление материала для конкретной поверхности
  updateSurfaceMaterial: (
    surface: "walls" | "floor" | "ceiling",
    material: RoomSurfaceMaterial,
  ) => void;

  // Изменение типа материала (color <-> texture)
  changeMaterialType: (
    surface: "walls" | "floor" | "ceiling",
    type: "color" | "texture",
  ) => void;

  // Установка цвета для поверхности
  setSurfaceColor: (
    surface: "walls" | "floor" | "ceiling",
    color: string,
  ) => void;

  // Установка текстуры для поверхности
  setSurfaceTexture: (
    surface: "walls" | "floor" | "ceiling",
    textureId: string,
  ) => void;

  // Обновление свойств материала (roughness, metalness, scale)
  updateMaterialProperties: (
    surface: "walls" | "floor" | "ceiling",
    properties: {
      roughness?: number;
      metalness?: number;
      scale?: number;
    },
  ) => void;

  // Сброс к значениям по умолчанию
  resetToDefaults: () => void;

  // Применение предустановки
  applyPreset: (preset: RoomMaterials) => void;
}

// Создаем store
export const useRoomMaterialsStore = create<RoomMaterialsStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // --- ИНИЦИАЛЬНОЕ СОСТОЯНИЕ ---
      currentMaterials: createDefaultRoomMaterials(),
      isLoading: false,

      // --- РЕАЛИЗАЦИЯ ЭКШЕНОВ ---

      updateSurfaceMaterial: (surface, material) => {
        set(
          (state) => ({
            ...state,
            currentMaterials: {
              ...state.currentMaterials,
              [surface]: material,
            },
          }),
          false,
          "updateSurfaceMaterial",
        );
      },

      changeMaterialType: (surface, type) => {
        set(
          (state) => {
            const currentMaterial = state.currentMaterials[surface];
            const updatedMaterial: RoomSurfaceMaterial = {
              ...currentMaterial,
              type,
              // При смене типа сохраняем разумные значения по умолчанию
              value: type === "color" ? "#FFFFFF" : { diffuse: "" }, // Пустой набор текстур, будет заполнен позже
            };

            return {
              ...state,
              currentMaterials: {
                ...state.currentMaterials,
                [surface]: updatedMaterial,
              },
            };
          },
          false,
          "changeMaterialType",
        );
      },

      setSurfaceColor: (surface, color) => {
        set(
          (state) => ({
            ...state,
            currentMaterials: {
              ...state.currentMaterials,
              [surface]: {
                ...state.currentMaterials[surface],
                type: "color" as const,
                value: color,
              },
            },
          }),
          false,
          "setSurfaceColor",
        );
      },

      setSurfaceTexture: (surface, textureId) => {
        set(
          (state) => ({
            ...state,
            currentMaterials: {
              ...state.currentMaterials,
              [surface]: {
                ...state.currentMaterials[surface],
                type: "texture" as const,
                value: textureId,
              },
            },
          }),
          false,
          "setSurfaceTexture",
        );
      },

      updateMaterialProperties: (surface, properties) => {
        set(
          (state) => ({
            ...state,
            currentMaterials: {
              ...state.currentMaterials,
              [surface]: {
                ...state.currentMaterials[surface],
                ...properties,
              },
            },
          }),
          false,
          "updateMaterialProperties",
        );
      },

      resetToDefaults: () => {
        set(
          (state) => ({
            ...state,
            currentMaterials: createDefaultRoomMaterials(),
          }),
          false,
          "resetToDefaults",
        );
      },

      applyPreset: (preset) => {
        set(
          (state) => ({
            ...state,
            currentMaterials: preset,
          }),
          false,
          "applyPreset",
        );
      },
    })),
    { name: "room-materials-store" }, // Имя для DevTools
  ),
);

// Утилиты для работы с store
export const useRoomMaterial = (surface: "walls" | "floor" | "ceiling") => {
  const materials = useRoomMaterialsStore((state) => state.currentMaterials);
  const updateMaterial = useRoomMaterialsStore(
    (state) => state.updateSurfaceMaterial,
  );
  const setColor = useRoomMaterialsStore((state) => state.setSurfaceColor);
  const setTexture = useRoomMaterialsStore((state) => state.setSurfaceTexture);
  const updateProperties = useRoomMaterialsStore(
    (state) => state.updateMaterialProperties,
  );

  return {
    material: materials[surface],
    updateMaterial,
    setColor,
    setTexture,
    updateProperties,
  };
};

// Предустановки материалов
export const roomMaterialPresets = {
  modern: {
    walls: {
      type: "color" as const,
      value: "#F5F5F5",
      roughness: 0.9,
      metalness: 0.0,
    },
    floor: {
      type: "color" as const,
      value: "#D4A574",
      roughness: 0.8,
      metalness: 0.1,
    },
    ceiling: {
      type: "color" as const,
      value: "#FFFFFF",
      roughness: 0.8,
      metalness: 0.0,
    },
  },
  industrial: {
    walls: {
      type: "texture" as const,
      value: "white-plaster",
      roughness: 0.9,
      metalness: 0.0,
      scale: 1.0,
    },
    floor: {
      type: "texture" as const,
      value: "white-plaster",
      roughness: 0.8,
      metalness: 0.1,
      scale: 2.0,
    },
    ceiling: {
      type: "color" as const,
      value: "#E0E0E0",
      roughness: 0.7,
      metalness: 0.0,
    },
  },
} as const;
