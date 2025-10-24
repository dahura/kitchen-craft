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
export interface MaterialDefinition {
  type: string;
  color?: string;
  finish?: string;
  roughness?: number;
  metalness?: number;
  diffuseMap?: string;
  normalMap?: string;
  roughnessMap?: string;
  // ... другие PBR свойства
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
  materialOverrides?: Partial<
    Record<"facade" | "countertop" | "handle", string>
  >;
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
  materialOverrides?: Partial<
    Record<"facade" | "countertop" | "handle", string>
  >;
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
    facade: string;
    countertop: string;
    handle: string;
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
}

export interface EnhancedKitchenConfig
  extends Omit<KitchenConfig, "globalSettings"> {
  globalSettings: EnhancedGlobalSettings;
}
