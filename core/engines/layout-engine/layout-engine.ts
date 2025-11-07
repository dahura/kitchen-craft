// layoutEngine.ts

import type {
  Dimensions,
  HandlePlacement,
  HangingModuleConfig,
  KitchenConfig,
  MaterialDefinition,
  MaterialLibrary,
  ModuleConfig,
  Position,
  RenderableModule,
  Rotation,
  KitchenBoundingBox,
  CenteringOptions,
  EnhancedKitchenConfig,
} from "../../types";
import { calculateKitchenBoundingBox } from "../../../app/(app)/(designer)/utils/room-boundary-calculator";

/**
 * Генерирует массив объектов для рендеринга из конфигурации кухни.
 * @param kitchenConfig - Конфигурация кухни от ИИ/пользователя
 * @param materialLibrary - Библиотека материалов из приложения
 * @returns Массив RenderableModule
 */
export function generate(
  kitchenConfig: KitchenConfig,
  materialLibrary: MaterialLibrary,
): RenderableModule[] {
  return generateWithCentering(kitchenConfig, materialLibrary, {
    enabled: false,
  });
}

/**
 * Генерирует массив объектов для рендеринга с возможностью центрирования.
 * @param kitchenConfig - Конфигурация кухни от ИИ/пользователя
 * @param materialLibrary - Библиотека материалов из приложения
 * @param centeringOptions - Опции центрирования кухни
 * @returns Массив RenderableModule
 */
export function generateWithCentering(
  kitchenConfig: KitchenConfig,
  materialLibrary: MaterialLibrary,
  centeringOptions: CenteringOptions,
): RenderableModule[] {
  const renderableModules: RenderableModule[] = [];
  const { globalSettings, defaultMaterials } = kitchenConfig;

  // --- Шаг 1: Обработка layoutLines ---
  for (const line of kitchenConfig.layoutLines) {
    const lineRotation = calculateRotation(line.direction);
    const processedModules = processModulesOnLine(
      line.modules,
      line.length,
      globalSettings,
    );

    // Determine along which axis the line extends (X or Z) and its direction (+/-)
    const isXAxis = Math.abs(line.direction.x) === 1;
    const sign = isXAxis
      ? Math.sign(line.direction.x)
      : Math.sign(line.direction.z);

    // Accumulator measuring distance from the line start (always positive)
    let currentOffset = 0;

    for (const module of processedModules) {
      // Calculate the module centre coordinate along the chosen axis
      const centreAlongAxis = currentOffset + module.finalWidth / 2;

      // Compose absolute 3-D position using axis + sign
      const position: Position = {
        x: isXAxis ? sign * centreAlongAxis : 0,
        y: 0,
        z: isXAxis ? 0 : sign * centreAlongAxis,
      };

      const renderableModule = createRenderableModule(
        module,
        position,
        lineRotation,
        globalSettings,
        defaultMaterials,
        materialLibrary,
      );

      renderableModules.push(renderableModule);

      // Increment offset: module width + configured gap (always positive)
      currentOffset +=
        module.finalWidth + globalSettings.rules.gapBetweenModules;
    }
  }

  // --- Шаг 2: Обработка hangingModules ---
  for (const hangingModule of kitchenConfig.hangingModules) {
    const baseModule = renderableModules.find(
      (m) => m.id === hangingModule.positioning.alignWithModule,
    );
    if (!baseModule) {
      console.warn(
        `Hanging module ${hangingModule.id} could not find its base module ${hangingModule.positioning.alignWithModule}`,
      );
      continue;
    }

    const renderableModule = createHangingModule(
      hangingModule,
      baseModule,
      globalSettings,
      defaultMaterials,
      materialLibrary,
    );
    renderableModules.push(renderableModule);
  }

  // Применяем центрирование если включено
  if (centeringOptions.enabled) {
    const centeredModules = applyCentering(
      renderableModules,
      kitchenConfig,
      centeringOptions,
    );
    return centeredModules;
  }

  return renderableModules;
}

/**
 * Применяет центрирование к массиву модулей
 */
function applyCentering(
  modules: RenderableModule[],
  kitchenConfig: KitchenConfig,
  centeringOptions: CenteringOptions,
): RenderableModule[] {
  // Вычисляем bounding box для всех модулей
  const boundingBox = calculateKitchenBoundingBox(modules);

  // Вычисляем центр комнаты
  const roomCenter = {
    x: kitchenConfig.globalSettings.dimensions.sideA! / 2,
    y: kitchenConfig.globalSettings.dimensions.height / 2,
    z: -kitchenConfig.globalSettings.dimensions.sideB! / 2,
  };

  // Вычисляем смещение для центрирования
  const offset = {
    x: roomCenter.x - boundingBox.center.x + (centeringOptions.offsetX || 0),
    y: centeringOptions.offsetY || 0, // Обычно не смещаем по Y
    z: roomCenter.z - boundingBox.center.z + (centeringOptions.offsetZ || 0),
  };

  // Применяем смещение ко всем модулям
  return modules.map((module) => {
    const centeredModule = {
      ...module,
      position: {
        x: module.position.x + offset.x,
        y: module.position.y + offset.y,
        z: module.position.z + offset.z,
      },
    };

    // Также смещаем дочерние элементы
    if (module.children && module.children.length > 0) {
      centeredModule.children = module.children.map((child) => ({
        ...child,
        position: {
          x: child.position.x + offset.x,
          y: child.position.y + offset.y,
          z: child.position.z + offset.z,
        },
      }));
    }

    return centeredModule;
  });
}

/**
 * Генерирует расширенную конфигурацию кухни с центрированием
 */
export function generateEnhanced(
  kitchenConfig: EnhancedKitchenConfig,
  materialLibrary: MaterialLibrary,
): RenderableModule[] {
  return generateWithCentering(
    kitchenConfig,
    materialLibrary,
    kitchenConfig.globalSettings.roomConfiguration.centering,
  );
}

// --- Вспомогательные функции ---

function calculateRotation(direction: { x: number; z: number }): Rotation {
  if (direction.x === 1 && direction.z === 0) return { x: 0, y: 0, z: 0 };
  if (direction.x === 0 && direction.z === -1) return { x: 0, y: 90, z: 0 };
  return { x: 0, y: 0, z: 0 };
}

function processModulesOnLine(
  modules: ModuleConfig[],
  lineLength: number,
  globalSettings: KitchenConfig["globalSettings"],
): (ModuleConfig & { finalWidth: number })[] {
  const fixedModules = modules.filter((m) => m.width !== "auto");
  const autoModules = modules.filter((m) => m.width === "auto");

  const totalFixedWidth = fixedModules.reduce(
    (sum, m) => sum + (m.width as number),
    0,
  );
  const totalGaps =
    (modules.length - 1) * globalSettings.rules.gapBetweenModules;
  const remainingSpace = lineLength - totalFixedWidth - totalGaps;

  const autoWidth =
    autoModules.length > 0 ? remainingSpace / autoModules.length : 0;

  return modules.map((module) => ({
    ...module,
    finalWidth: module.width === "auto" ? autoWidth : module.width,
  }));
}

function createRenderableModule(
  module: ModuleConfig & { finalWidth: number },
  relativePos: Position,
  rotation: Rotation,
  globalSettings: KitchenConfig["globalSettings"],
  defaultMaterials: KitchenConfig["defaultMaterials"],
  materialLibrary: MaterialLibrary,
): RenderableModule {
  const dimensions: Dimensions = {
    width: module.finalWidth,
    height:
      module.positioning.offset.y ||
      globalSettings.dimensions.baseCabinetHeight,
    depth: globalSettings.dimensions.countertopDepth,
  };

  // Определяем, нужно ли размещать модуль на цоколе
  const needsPlinth = module.type === "base" || module.type === "sink";
  const plinthOffset = needsPlinth ? globalSettings.dimensions.plinthHeight : 0;

  const position: Position = {
    x: relativePos.x,
    y: (module.positioning.offset.y || 0) + plinthOffset,
    z: relativePos.z,
  };

  const mainModule: RenderableModule = {
    id: module.id,
    type: module.type,
    variant: module.variant || "default",
    position,
    rotation,
    dimensions,
    structure: module.structure || {
      type: "door-and-shelf",
      doorCount: 1,
      shelves: [],
    },
    carcass: module.carcass || { thickness: 1.8, backPanelThickness: 0.5 },
    materials: resolveMaterials(module, defaultMaterials, materialLibrary),
    children: [],
  };

  if (module.handle && defaultMaterials.handle) {
    const handleDefinition = materialLibrary.handles[defaultMaterials.handle];
    if (handleDefinition) {
      const handleModule = createHandleModule(
        module.handle.placement,
        mainModule,
        handleDefinition.material,
      );
      mainModule.children.push(handleModule);
    }
  }

  return mainModule;
}

function createHangingModule(
  hangingModule: HangingModuleConfig,
  baseModule: RenderableModule,
  globalSettings: KitchenConfig["globalSettings"],
  defaultMaterials: KitchenConfig["defaultMaterials"],
  materialLibrary: MaterialLibrary,
): RenderableModule {
  const position: Position = {
    x: baseModule.position.x,
    y:
      globalSettings.dimensions.countertopHeight +
      globalSettings.dimensions.wallGap,
    z: baseModule.position.z,
  };

  const dimensions: Dimensions = {
    width:
      hangingModule.width === "auto"
        ? baseModule.dimensions.width
        : (hangingModule.width as number),
    height: globalSettings.dimensions.wallCabinetHeight,
    depth: globalSettings.dimensions.wallCabinetDepth,
  };

  return {
    id: hangingModule.id,
    type: hangingModule.type,
    variant: hangingModule.variant,
    position,
    rotation: baseModule.rotation,
    dimensions,
    structure: hangingModule.structure || {
      type: "door-and-shelf",
      doorCount: hangingModule.variant === "double_door" ? 2 : 1,
      shelves: [],
    },
    carcass: hangingModule.carcass || {
      thickness: 1.8,
      backPanelThickness: 0.5,
    },
    materials: resolveMaterials(
      hangingModule,
      defaultMaterials,
      materialLibrary,
    ),
    children: [],
  };
}

function createHandleModule(
  placement: HandlePlacement,
  parentModule: RenderableModule,
  handleMaterial: MaterialDefinition,
): RenderableModule {
  const position: Position = {
    x: parentModule.position.x,
    y: parentModule.position.y,
    z: parentModule.position.z + parentModule.dimensions.depth / 2,
  };

  const rotation: Rotation = { ...parentModule.rotation };
  if (placement.orientation === "horizontal") rotation.z += 90;

  return {
    id: `${parentModule.id}-handle`,
    type: "handle",
    variant: "standard",
    position,
    rotation,
    dimensions: { width: 15, height: 5, depth: 3 },
    structure: { type: "door-and-shelf", doorCount: 1, shelves: [] },
    carcass: { thickness: 1.8, backPanelThickness: 0.5 },
    materials: { facade: handleMaterial },
    children: [],
  };
}

function resolveMaterials(
  module: ModuleConfig | HangingModuleConfig,
  defaultMaterials: KitchenConfig["defaultMaterials"],
  materialLibrary: MaterialLibrary,
): Record<string, MaterialDefinition> {
  const resolved: Record<string, MaterialDefinition> = {};
  const overrides = module.materialOverrides || {};
  const materialTypeMap: Record<string, keyof MaterialLibrary> = {
    facade: "facades",
    countertop: "countertops",
    handle: "handles",
  };

  const materialTypes = ["facade", "countertop", "handle"] as const;

  for (const type of materialTypes) {
    const key = overrides[type] || defaultMaterials[type];
    const libraryProperty = materialTypeMap[type];

    if (
      key &&
      materialLibrary[libraryProperty] &&
      materialLibrary[libraryProperty][key]
    ) {
      // For handles, we need to extract the material from the handle definition
      if (type === "handle") {
        const handleDef = materialLibrary.handles[key];
        if (handleDef) {
          resolved[type] = handleDef.material;
        }
      } else {
        resolved[type] = materialLibrary[libraryProperty][
          key
        ] as MaterialDefinition;
      }
    }
  }
  return resolved;
}
