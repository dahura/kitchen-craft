# План улучшения комнаты и камеры для 3D кухни

## Проблема
Текущая комната слишком маленькая (600см x 500см x 320см), что делает невозможным комфортный обзор кухни. Камера находится слишком близко к модели.

## Решение
Увеличить комнату в 4 раза и настроить камеру для лучшего обзора.

## Изменения в коде

### 1. Увеличение размеров комнаты в `app/(app)/(designer)/tree-canvas.tsx`

В функции `roomDimensions` (строки 68-84) нужно изменить:
- Увеличить margin с 150см на 600см (в 4 раза)
- Увеличить запас высоты с 100см на 200см

```typescript
// Было:
const margin = 150; // 150cm запас с каждой стороны
return {
  width: sideA + margin * 2,
  depth: sideB + margin * 2,
  height: height + 100, // 100cm запас сверху
  // ...
};

// Станет:
const margin = 600; // 600cm запас с каждой стороны (в 4 раза больше)
return {
  width: sideA + margin * 2,
  depth: sideB + margin * 2,
  height: height + 200, // 200cm запас сверху
  // ...
};
```

### 2. Увеличение размеров комнаты в `ThreeCanvas` компоненте

В функции `roomDimensions` (строки 165-176) нужно применить те же изменения:
- Увеличить margin с 150см на 600см
- Увеличить запас высоты с 100см на 200см

### 3. Настройка безопасной зоны камеры в `app/(app)/(designer)/utils/room-boundary-calculator.ts`

В функции `calculateCameraSafeZone` (строки 95-110) нужно увеличить максимальную дистанцию:

```typescript
// Было:
return {
  minDistance: maxDimension * 0.2,
  maxDistance: maxDimension * 1.5,
  // ...
};

// Станет:
return {
  minDistance: maxDimension * 0.3,
  maxDistance: maxDimension * 2.5, // Увеличиваем для большего отдаления
  // ...
};
```

### 4. Оптимизация расчета позиции камеры в `app/(app)/(designer)/utils/room-boundary-calculator.ts`

В функции `calculateOptimalCameraPosition` (строки 115-144) нужно увеличить базовую дистанцию:

```typescript
// Было:
const baseDistance = Math.max(roomWidth, roomDepth) * 0.8;
const aspectRatioAdjustment = aspectRatio > 1 ? 1.2 : 1.0;
const cameraDistance = baseDistance * aspectRatioAdjustment;

// Станет:
const baseDistance = Math.max(roomWidth, roomDepth) * 1.2; // Увеличиваем базовую дистанцию
const aspectRatioAdjustment = aspectRatio > 1 ? 1.5 : 1.2; // Увеличиваем корректировку
const cameraDistance = baseDistance * aspectRatioAdjustment;
```

### 5. Настройка ограничений камеры в `app/(app)/(designer)/components/bounded-orbit-controls.tsx`

В функции `checkRoomBoundaries` (строки 91-129) нужно увеличить margin с 20 до 50:

```typescript
// Было:
if (!isPositionInsideRoom(pos, roomBoundaries, 20)) {
  const constrainedPos = constrainCameraPosition(pos, roomBoundaries, 20);
  // ...
}

// Станет:
if (!isPositionInsideRoom(pos, roomBoundaries, 50)) {
  const constrainedPos = constrainCameraPosition(pos, roomBoundaries, 50);
  // ...
}
```

## Ожидаемый результат
1. Комната станет в 4 раза больше (ширина: 1500см, глубина: 1400см, высота: 420см)
2. Камера сможет отодвигаться дальше для лучшего обзора
3. Модель кухни будет центрирована в комнате
4. Улучшится общая навигация и обзор 3D модели

## Порядок выполнения
1. Изменить размеры комнаты в `SceneContent`
2. Изменить размеры комнаты в `ThreeCanvas`
3. Настроить безопасную зону камеры
4. Оптимизировать расчет позиции камеры
5. Настроить ограничения камеры
6. Протестировать изменения