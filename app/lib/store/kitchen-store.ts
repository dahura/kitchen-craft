// lib/store/kitchenStore.ts
import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { generate } from "@/core/engines/layout-engine/layout-engine";
import { validateAndFix } from "@/core/engines/validator-engine/validator-engine";
import { exampleKitchenConfig } from "@/core/examples/example-kitchen-config";
import { materialLibrary } from "@/core/libraries/material-library/material-library";
import { moduleLibrary } from "@/core/libraries/module-library/module-library";
import type {
  KitchenConfig,
  ModuleConfig,
  RenderableModule,
} from "@/core/types";

// Определяем интерфейс нашего хранилища
interface KitchenStore {
  // --- СОСТОЯНИЕ (STATE) ---
  currentConfig: KitchenConfig;
  renderableModules: RenderableModule[];
  warnings: string[];
  errors: string[];
  isLoading: boolean;

  // --- ЭКШЕНЫ (ACTIONS) ---
  // Главный метод для перегенерации сцены
  regenerate: () => void;
  // Загрузка новой конфигурации
  loadConfig: (config: KitchenConfig) => void;

  // Действия с модулями
  addModuleToLine: (
    lineId: string,
    moduleData: Omit<ModuleConfig, "id">,
  ) => void;
  updateModule: (
    lineId: string,
    moduleId: string,
    updates: Partial<ModuleConfig>,
  ) => void;
  removeModuleFromLine: (lineId: string, moduleId: string) => void;

  // Действия с материалами
  changeDefaultMaterial: (
    type: "facade" | "countertop" | "handle",
    materialKey: string,
  ) => void;
}

// Создаем сам store
export const useKitchenStore = create<KitchenStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // --- ИНИЦИАЛЬНОЕ СОСТОЯНИЕ ---
      currentConfig: exampleKitchenConfig,
      renderableModules: [],
      warnings: [],
      errors: [],
      isLoading: false,

      // --- РЕАЛИЗАЦИЯ ЭКШЕНОВ ---

      regenerate: () => {
        console.log("Regenerating scene...");
        set({ isLoading: true });
        const { currentConfig } = get();

        // 1. Валидация
        const validation = validateAndFix(
          currentConfig,
          currentConfig.globalConstraints,
          moduleLibrary,
        );

        // 2. Генерация
        const renderableModules = generate(
          validation.fixedConfig,
          materialLibrary,
        );

        // 3. Обновление состояния
        set({
          currentConfig: validation.fixedConfig,
          renderableModules,
          warnings: validation.warnings,
          errors: validation.errors,
          isLoading: false,
        });
      },

      loadConfig: (config) => {
        set(
          (state) => ({
            ...state,
            currentConfig: config,
          }),
          false,
          "loadConfig",
        );
        get().regenerate();
      },

      addModuleToLine: (lineId, moduleData) => {
        set(
          (state) => {
            const line = state.currentConfig.layoutLines.find(
              (l) => l.id === lineId,
            );
            if (!line) return state;

            const newModule: ModuleConfig = {
              ...moduleData,
              id: `module-${Date.now()}`, // Генерируем уникальный ID
            };

            line.modules.push(newModule);
            return { currentConfig: { ...state.currentConfig } };
          },
          false,
          "addModuleToLine",
        );
        get().regenerate();
      },

      updateModule: (lineId, moduleId, updates) => {
        set(
          (state) => {
            const line = state.currentConfig.layoutLines.find(
              (l) => l.id === lineId,
            );
            if (!line) return state;

            const moduleIndex = line.modules.findIndex(
              (m) => m.id === moduleId,
            );
            if (moduleIndex === -1) return state;

            line.modules[moduleIndex] = {
              ...line.modules[moduleIndex],
              ...updates,
            };
            return { currentConfig: { ...state.currentConfig } };
          },
          false,
          "updateModule",
        );
        get().regenerate();
      },

      removeModuleFromLine: (lineId, moduleId) => {
        set(
          (state) => {
            const line = state.currentConfig.layoutLines.find(
              (l) => l.id === lineId,
            );
            if (!line) return state;

            line.modules = line.modules.filter((m) => m.id !== moduleId);
            return { currentConfig: { ...state.currentConfig } };
          },
          false,
          "removeModuleFromLine",
        );
        get().regenerate();
      },

      changeDefaultMaterial: (type, materialKey) => {
        set(
          (state) => ({
            ...state,
            currentConfig: {
              ...state.currentConfig,
              defaultMaterials: {
                ...state.currentConfig.defaultMaterials,
                [type]: materialKey,
              },
            },
          }),
          false,
          "changeDefaultMaterial",
        );
        get().regenerate();
      },
    })),
    { name: "kitchen-store" }, // Имя для DevTools
  ),
);

// Инициализация при первом импорте
useKitchenStore.getState().regenerate();
