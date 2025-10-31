# План модификации компонента Room для поддержки текстур

## Обзор
Модифицировать компонент `app/(app)/(designer)/components/room.tsx` для поддержки новой системы текстур комнат с сохранением обратной совместимости.

## Текущая реализация

### Проблемы
1. Жестко заданные цвета материалов
2. Нет поддержки текстур
3. Материалы создаются внутри компонента
4. Нет возможности конфигурации

### Текущий код (строки 14-49)
```typescript
const floorMaterial = useMemo(
  () => (
    <meshStandardMaterial
      color="#D4A574" // Светло-деревянный цвет (дуб)
      roughness={0.8}
      metalness={0.1}
      side={THREE.DoubleSide}
    />
  ),
  [],
);
```

## Новая архитектура

### 1. Новый интерфейс компонента

```typescript
interface RoomProps {
  roomWidth: number;
  roomDepth: number;
  roomHeight: number;
  materials?: RoomMaterials; // Новое опциональное поле
}
```

### 2. Хук для управления материалами

Создать `app/(app)/(designer)/hooks/useRoomMaterials.ts`:

```typescript
import { useMemo } from "react";
import * as THREE from "three";
import { RoomMaterials, RoomSurfaceMaterial } from "../../../../core/types";

export const useRoomMaterials = (materials?: RoomMaterials) => {
  return useMemo(() => {
    // Если материалы не предоставлены, используем значения по умолчанию
    const defaultMaterials = createDefaultRoomMaterials();
    const roomMaterials = materials || defaultMaterials;
    
    return {
      floor: createMaterial(roomMaterials.floor),
      walls: createMaterial(roomMaterials.walls),
      ceiling: createMaterial(roomMaterials.ceiling),
    };
  }, [materials]);
};

const createMaterial = (surfaceMaterial: RoomSurfaceMaterial) => {
  if (surfaceMaterial.type === "color") {
    return new THREE.MeshStandardMaterial({
      color: surfaceMaterial.value as string,
      roughness: surfaceMaterial.roughness || 0.8,
      metalness: surfaceMaterial.metalness || 0.0,
      side: THREE.DoubleSide,
    });
  }
  
  // Для текстур будем использовать TextureLoader
  return new THREE.MeshStandardMaterial({
    color: "#FFFFFF", // Базовый белый цвет
    roughness: surfaceMaterial.roughness || 0.8,
    metalness: surfaceMaterial.metalness || 0.0,
    side: THREE.DoubleSide,
  });
};
```

### 3. Обновленный компонент Room

```typescript
export const Room = ({ 
  roomWidth, 
  roomDepth, 
  roomHeight, 
  materials 
}: RoomProps) => {
  const roomMaterials = useRoomMaterials(materials);
  
  // Линии для обозначения границ комнаты (без изменений)
  const boundaryLines = useMemo(() => {
    // ... существующий код
  }, [roomWidth, roomDepth]);

  return (
    <group>
      {/* Пол */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[roomWidth / 2, 0, -roomDepth / 2]}
        receiveShadow
      >
        <planeGeometry args={[roomWidth, roomDepth]} />
        <primitive object={roomMaterials.floor} />
      </mesh>

      {/* Задняя стена */}
      <mesh
        position={[roomWidth / 2, roomHeight / 2, -roomDepth]}
        receiveShadow
      >
        <planeGeometry args={[roomWidth, roomHeight]} />
        <primitive object={roomMaterials.walls} />
      </mesh>

      {/* Левая боковая стена */}
      <mesh
        position={[0, roomHeight / 2, -roomDepth / 2]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[roomDepth, roomHeight]} />
        <primitive object={roomMaterials.walls} />
      </mesh>

      {/* Правая боковая стена */}
      <mesh
        position={[roomWidth, roomHeight / 2, -roomDepth / 2]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[roomDepth, roomHeight]} />
        <primitive object={roomMaterials.walls} />
      </mesh>

      {/* Передняя стена */}
      <mesh position={[roomWidth / 2, roomHeight / 2, 0]} receiveShadow>
        <planeGeometry args={[roomWidth, roomHeight]} />
        <primitive object={roomMaterials.walls} />
      </mesh>

      {/* Потолок */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[roomWidth / 2, roomHeight, -roomDepth / 2]}
        receiveShadow
      >
        <planeGeometry args={[roomWidth, roomDepth]} />
        <primitive object={roomMaterials.ceiling} />
      </mesh>

      {/* Границы комнаты (без изменений) */}
      <Line
        points={boundaryLines}
        color="#888888"
        lineWidth={2}
        opacity={0.5}
        transparent
      />
    </group>
  );
};
```

### 4. Поддержка текстур

#### Утилита для загрузки текстур

```typescript
// app/(app)/(designer)/utils/texture-loader.ts
import * as THREE from "three";
import { RoomTextureSet } from "../../../../core/types";

export const loadTextureSet = async (
  textureSet: RoomTextureSet,
  basePath: string
): Promise<THREE.MeshStandardMaterial> => {
  const textureLoader = new THREE.TextureLoader();
  
  const promises = [];
  const textures: Record<string, THREE.Texture> = {};
  
  if (textureSet.diffuse) {
    promises.push(
      new Promise<void>((resolve) => {
        textureLoader.load(
          `${basePath}/${textureSet.diffuse}`,
          (texture) => {
            textures.map = texture;
            resolve();
          }
        );
      })
    );
  }
  
  if (textureSet.normal) {
    promises.push(
      new Promise<void>((resolve) => {
        textureLoader.load(
          `${basePath}/${textureSet.normal}`,
          (texture) => {
            textures.normalMap = texture;
            resolve();
          }
        );
      })
    );
  }
  
  if (textureSet.roughness) {
    promises.push(
      new Promise<void>((resolve) => {
        textureLoader.load(
          `${basePath}/${textureSet.roughness}`,
          (texture) => {
            textures.roughnessMap = texture;
            resolve();
          }
        );
      })
    );
  }
  
  await Promise.all(promises);
  
  return new THREE.MeshStandardMaterial({
    ...textures,
    side: THREE.DoubleSide,
  });
};
```

### 5. Обратная совместимость

Компонент будет работать без параметра `materials`:
```typescript
// Старый способ (продолжает работать)
<Room roomWidth={400} roomDepth={300} roomHeight={250} />

// Новый способ с текстурами
<Room 
  roomWidth={400} 
  roomDepth={300} 
  roomHeight={250}
  materials={roomMaterials}
/>
```

## Преимущества новой архитектуры

1. **Обратная совместимость**: Существующий код продолжает работать
2. **Гибкость**: Поддержка как цветов, так и текстур
3. **Производительность**: Кеширование материалов через useMemo
4. **Разделение ответственности**: Логика материалов вынесена в хук
5. **Масштабируемость**: Легкое добавление новых типов поверхностей
6. **Type Safety**: Полная типизация всех параметров