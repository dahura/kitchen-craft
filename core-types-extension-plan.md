# План расширения core/types.ts для поддержки текстур комнат

## Обзор
Необходимо расширить существующие типы в `core/types.ts` для поддержки системы текстур комнат, сохраняя обратную совместимость.

## Новые интерфейсы для добавления

### 1. Типы для текстур комнат

```typescript
// Набор PBR текстур для поверхности
interface RoomTextureSet {
  diffuse?: string;      // Base color map
  normal?: string;       // Normal map  
  roughness?: string;    // Roughness map
  displacement?: string; // Height/displacement map
  ambientOcclusion?: string; // AO map (опционально)
}

// Материал поверхности комнаты
interface RoomSurfaceMaterial {
  type: "color" | "texture";
  value: string | RoomTextureSet;
  roughness?: number;
  metalness?: number;
  scale?: number;        // Масштаб текстуры
}

// Материалы комнаты
interface RoomMaterials {
  walls: RoomSurfaceMaterial;
  floor: RoomSurfaceMaterial;
  ceiling: RoomSurfaceMaterial;
}

// Библиотека текстур комнат
interface RoomTextureLibrary {
  walls: Record<string, RoomTextureSet>;
  floors: Record<string, RoomTextureSet>;
  ceilings: Record<string, RoomTextureSet>;
}
```

### 2. Обновление существующих интерфейсов

#### Расширение RoomConfiguration
```typescript
// Существующий интерфейс (строка 253-258)
interface RoomConfiguration {
  width: number;
  depth: number;
  height: number;
  centering: CenteringOptions;
  // Добавляем новое поле:
  materials?: RoomMaterials; // Опционально для обратной совместимости
}
```

#### Расширение EnhancedGlobalSettings
```typescript
// Существующий интерфейс (строка 273-281)
interface EnhancedGlobalSettings extends GlobalSettings {
  roomConfiguration: RoomConfiguration;
  cameraConstraints: CameraConstraints;
  viewportAdaptation: {
    enabled: boolean;
    adaptFov: boolean;
    baseFov: number;
  };
  // Добавляем новое поле:
  defaultRoomMaterials?: RoomMaterials; // Опционально
}
```

### 3. Порядок добавления в файл

Новые интерфейсы следует добавить в конец файла перед `export type EnhancedKitchenConfig`:

```typescript
// --- НОВЫЕ ИНТЕРФЕЙСЫ ДЛЯ ТЕКСТУР КОМНАТ ---

// [Здесь добавляем новые интерфейсы]

// --- ОБНОВЛЕННЫЕ ИНТЕРФЕЙСЫ КОНФИГУРАЦИИ ---

// [Здесь обновляем существующие интерфейсы]

export interface EnhancedKitchenConfig
  extends Omit<KitchenConfig, "globalSettings"> {
  globalSettings: EnhancedGlobalSettings;
}
```

### 4. Значения по умолчанию

Для обратной совместимости добавим утилиту для создания значений по умолчанию:

```typescript
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
```

### 5. Обратная совместимость

Все новые поля должны быть опциональными (`?`) для сохранения обратной совместимости с существующими конфигурациями.

### 6. Миграция существующего кода

Компонент `Room` должен продолжать работать с текущими цветовыми материалами, но поддерживать новые текстурные материалы.

## Преимущества подхода

1. **Обратная совместимость**: Существующий код продолжает работать
2. **Type Safety**: Полная типизация новых возможностей  
3. **Масштабируемость**: Легкое добавление новых типов поверхностей
4. **Изоляция**: Текстуры комнат отделены от материалов кухни
5. **Гибкость**: Поддержка как цветов, так и текстур