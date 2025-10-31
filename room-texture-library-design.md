# Дизайн RoomTextureLibrary

## Обзор
RoomTextureLibrary - это система управления текстурами для поверхностей комнат (стены, пол, потолок), независимая от MaterialLibrary для кухни.

## Архитектура

### 1. Типы данных

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

### 2. Структура файлов

```
core/libraries/room-texture-library/
├── room-texture-library.ts    // Основная библиотека
├── texture-loader.ts         // Утилиты загрузки
└── index.ts                  // Экспорты
```

### 3. Конфигурация по умолчанию

```typescript
export const defaultRoomMaterials: RoomMaterials = {
  walls: {
    type: "texture",
    value: "white-plaster",
    scale: 1.0,
    roughness: 0.9
  },
  floor: {
    type: "texture", 
    value: "white-plaster",
    scale: 2.0,
    roughness: 0.8
  },
  ceiling: {
    type: "color",
    value: "#FFFFFF",
    roughness: 0.8
  }
};
```

### 4. Интеграция с RoomConfiguration

```typescript
interface RoomConfiguration {
  width: number;
  depth: number;
  height: number;
  centering: CenteringOptions;
  materials: RoomMaterials; // Новое поле
}
```

### 5. Путь к текстурам

Все пути к текстурам должны быть относительными от корня public:
```typescript
const texturePaths = {
  walls: "/textures/rooms/walls/",
  floors: "/textures/rooms/floors/", 
  ceilings: "/textures/rooms/ceilings/"
};
```

## Использование в компонентах

### Хук useRoomMaterials
```typescript
const useRoomMaterials = (materials: RoomMaterials) => {
  // Загрузка текстур
  // Создание Three.js материалов
  // Кеширование
};
```

### Компонент Room
```typescript
export const Room = ({ configuration }: { configuration: RoomConfiguration }) => {
  const materials = useRoomMaterials(configuration.materials);
  
  return (
    <group>
      <mesh material={materials.floor}>...</mesh>
      <mesh material={materials.walls}>...</mesh>
      <mesh material={materials.ceiling}>...</mesh>
    </group>
  );
};
```

## Преимущества архитектуры

1. **Разделение ответственности**: Текстуры комнат изолированы от кухни
2. **Масштабируемость**: Легко добавлять новые текстуры
3. **Гибкость**: Поддержка как текстур, так и цветов
4. **Производительность**: Кеширование загруженных текстур
5. **Type Safety**: Полная типизация всех интерфейсов