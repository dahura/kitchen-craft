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
} from "../../types";

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

    let currentX = 0;
    for (const module of processedModules) {
      const renderableModule = createRenderableModule(
        module,
        { x: currentX, y: 0, z: 0 },
        lineRotation,
        globalSettings,
        defaultMaterials,
        materialLibrary,
      );
      renderableModules.push(renderableModule);
      currentX += module.finalWidth + globalSettings.rules.gapBetweenModules; // finalWidth гарантированно есть после processModulesOnLine
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

  return renderableModules;
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
    structure: module.structure || { type: "door-and-shelf", doorCount: 1, shelves: [] },
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
    structure: { type: "door-and-shelf", doorCount: 1, shelves: [] },
    carcass: { thickness: 1.8, backPanelThickness: 0.5 },
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
