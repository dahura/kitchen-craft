// types.ts

// --- Основные геометрические типы ---
export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Rotation {
  x: number;
  y: number;
  z: number;
}

export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

// --- Типы для Material Library ---
// Memory: Available facade materials - used for strict typing and IDE autocomplete
export type FacadeMaterialId =
  | "loft_dark_glossy"
  | "cabinet_blue"
  | "cabinet_blue.light"
  | "cabinet_blue.dark"
  | "cabinet_blue.matte"
  | "cabinet_blue.glossy";

export type CountertopMaterialId = "concrete_grey" | "quartz_grey";

export type HandleMaterialId = "minimalist_bar_black";

export interface MaterialDefinition {
  type: string;
  color?: string;
  finish?: string;
  roughness?: number;
  metalness?: number;
  diffuseMap?: string;
  normalMap?: string;
  roughnessMap?: string;
  displacementMap?: string;
  aoMap?: string;
  // Memory: Extended PBR properties to support both paint and textured materials

  // Material variations support
  brightness?: number; // 0-1: 0.5 = default, >0.5 = lighter, <0.5 = darker
  colorTint?: string; // HEX color for tinting (#FFFFFF = lighter tint)
  emissiveIntensity?: number; // For adding glow/matte effect
  roughnessOverride?: number; // Override roughness for variations (e.g., glossy/matte)
}

export interface HandleSource {
  type: "static_model" | "procedural"; // Тип источника
  url?: string; // для static_model
  generator?: string; // для procedural
  params?: Record<string, unknown>; // для procedural
}

export interface MaterialLibrary {
  facades: Record<string, MaterialDefinition>;
  countertops: Record<string, MaterialDefinition>;
  handles: Record<
    string,
    {
      source: HandleSource;
      material: MaterialDefinition;
    }
  >;
}

// --- Типы для Kitchen Config ---
export interface Positioning {
  anchor: "floor" | "countertop" | "floor-and-ceiling";
  offset: { y: number };
}

export interface HandlePlacement {
  type: "centered" | "per-drawer";
  orientation: "horizontal" | "vertical";
  offsetFromTop?: number;
}

export interface ModuleConfig {
  id: string;
  type: string;
  variant?: string; // variant становится опциональным, т.к. structure важнее
  width: number | "auto";
  positioning: Positioning;
  materialOverrides?: {
    facade?: FacadeMaterialId;
    countertop?: CountertopMaterialId;
    handle?: HandleMaterialId;
  };
  handle?: {
    placement: HandlePlacement;
  };
  constraints?: {
    fillsRemainingSpace: boolean;
  };

  // --- НОВЫЕ ПОЛЯ ---
  structure?: Structure; // Описание внутреннего наполнения
  carcass?: Carcass; // Описание корпуса

  // Поля, которые добавляет Validation Engine
  finalWidth?: number;
}

export interface LayoutLine {
  id: string;
  name: string;
  length: number;
  direction: { x: number; z: number };
  modules: ModuleConfig[];
}

export interface HangingModuleConfig {
  id: string;
  type: string;
  variant: string;
  width: number | "auto";
  positioning: {
    anchor: "countertop";
    offset: { y: number };
    alignWithModule: string;
  };
  materialOverrides?: {
    facade?: FacadeMaterialId;
    countertop?: CountertopMaterialId;
    handle?: HandleMaterialId;
  };
  structure?: Structure; // Описание внутреннего наполнения
  carcass?: Carcass; // Описание корпуса
}

export interface GlobalSettings {
  dimensions: {
    sideA?: number;
    sideB?: number;
    height: number;
    countertopHeight: number;
    countertopDepth: number;
    countertopThickness: number;
    wallGap: number;
    baseCabinetHeight: number;
    wallCabinetHeight: number;
    wallCabinetDepth: number;
    plinthHeight: number;
    plinthDepth: number;
  };
  rules: {
    mismatchPolicy: "warn" | "error" | "auto_fix";
    gapBetweenModules: number;
  };
}

export interface KitchenConfig {
  kitchenId: string;
  name: string;
  style: string;
  globalSettings: GlobalSettings;
  globalConstraints: GlobalConstraints;
  defaultMaterials: {
    facade: FacadeMaterialId;
    countertop: CountertopMaterialId;
    handle: HandleMaterialId;
  };
  layoutLines: LayoutLine[];
  hangingModules: HangingModuleConfig[];
}

// --- Типы для выхода Layout Engine ---
export interface RenderableModule {
  id: string;
  type: string;
  variant: string;
  position: Position;
  rotation: Rotation;
  dimensions: Dimensions;
  structure: Structure;
  carcass: Carcass;
  materials: {
    facade?: MaterialDefinition;
    countertop?: MaterialDefinition;
    handle?: MaterialDefinition;
  };
  children: RenderableModule[];
}

// types.ts (дополненная версия)

// ... (все предыдущие интерфейсы) ...

// --- Типы для Validation Engine ---
export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  fixedConfig: KitchenConfig;
}

export interface ModuleVariantConstraints {
  defaultHeight?: number;
  defaultWidth?: number;
  minWidth: number;
  maxWidth: number;
}

export interface ModuleLibrary {
  [moduleType: string]: {
    variants: {
      [variant: string]: ModuleVariantConstraints;
    };
  };
}

export interface GlobalConstraints {
  modules: {
    minWidth: number;
    maxWidth: number;
  };
  handles: {
    minDistanceFromEdge: number;
  };
}

// core/types.ts

// ... (все предыдущие интерфейсы) ...

// --- НОВЫЕ ИНТЕРФЕЙСЫ ДЛЯ ВНУТРЕННЕЙ СТРУКТУРЫ ---

export interface Carcass {
  thickness: number; // Толщина ДСП/корпуса
  backPanelThickness?: number; // Толщина задней стенки
}

export interface DrawerStructure {
  type: "drawers";
  count: number;
  drawerHeights: number[]; // Массив высот каждого ящика
  internalDepth: number; // Глубина ящиков (обычно меньше глубины шкафа)
}

export interface DoorAndShelfStructure {
  type: "door-and-shelf";
  doorCount: number; // 1 или 2
  shelves: { positionFromBottom: number }[]; // Массив полок
}

export type Structure = DrawerStructure | DoorAndShelfStructure;

// --- ОБНОВЛЯЕМ ОСНОВНОЙ ИНТЕРФЕКС МОДУЛЯ ---

// Заменяем старый интерфейс ModuleConfig на этот, обогащенный

// --- НОВЫЕ ИНТЕРФЕЙСЫ ДЛЯ ЦЕНТРИРОВАНИЯ КУХНИ ---

export interface KitchenBoundingBox {
  min: Position;
  max: Position;
  center: Position;
  width: number;
  height: number;
  depth: number;
}

export interface CenteringOptions {
  enabled: boolean;
  offsetX?: number;
  offsetY?: number;
  offsetZ?: number;
  maintainRelativePositions?: boolean;
}

export interface RoomConfiguration {
  width: number;
  depth: number;
  height: number;
  centering: CenteringOptions;
  materials?: RoomMaterials; // Опционально для обратной совместимости
}

export interface CameraConstraints {
  enableBoundaries: boolean;
  boundaryMargin: number;
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  minAzimuthAngle: number;
  maxAzimuthAngle: number;
}

// --- ОБНОВЛЕННЫЕ ИНТЕРФЕЙСЫ КОНФИГУРАЦИИ ---

export interface EnhancedGlobalSettings extends GlobalSettings {
  roomConfiguration: RoomConfiguration;
  cameraConstraints: CameraConstraints;
  viewportAdaptation: {
    enabled: boolean;
    adaptFov: boolean;
    baseFov: number;
  };
  defaultRoomMaterials?: RoomMaterials; // Опционально
}

// --- НОВЫЕ ИНТЕРФЕЙСЫ ДЛЯ ТЕКСТУР КОМНАТ ---

interface RoomTextureSet {
  diffuse?: string; // Base color map
  normal?: string; // Normal map
  roughness?: string; // Roughness map
  displacement?: string; // Height/displacement map
  ambientOcclusion?: string; // AO map (опционально)
}

interface RoomSurfaceMaterial {
  type: "color" | "texture";
  value: string | RoomTextureSet;
  roughness?: number;
  metalness?: number;
  scale?: number; // Масштаб текстуры
}

interface RoomMaterials {
  walls: RoomSurfaceMaterial;
  floor: RoomSurfaceMaterial;
  ceiling: RoomSurfaceMaterial;
}

interface RoomTextureLibrary {
  walls: Record<string, RoomTextureSet>;
  floors: Record<string, RoomTextureSet>;
  ceilings: Record<string, RoomTextureSet>;
}

// Утилита для создания значений по умолчанию
export const createDefaultRoomMaterials = (): RoomMaterials => ({
  walls: {
    type: "color",
    value: "#F5F5F5", // Текущий цвет стен
    roughness: 0.9,
    metalness: 0.0,
  },
  floor: {
    type: "color",
    value: "#D4A574", // Текущий цвет пола
    roughness: 0.8,
    metalness: 0.1,
  },
  ceiling: {
    type: "color",
    value: "#FFFFFF", // Текущий цвет потолка
    roughness: 0.8,
    metalness: 0.0,
  },
});

export interface EnhancedKitchenConfig
  extends Omit<KitchenConfig, "globalSettings"> {
  globalSettings: EnhancedGlobalSettings;
}

// Экспортируем новые типы для использования в других модулях
export type {
  RoomTextureSet,
  RoomSurfaceMaterial,
  RoomMaterials,
  RoomTextureLibrary,
};
