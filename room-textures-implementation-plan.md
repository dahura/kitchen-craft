# Полный план реализации системы текстур комнат

## Обзор
Документ содержит полный план по реализации системы текстур для комнат в проекте Kitchen Craft.

## Архитектурная диаграмма

```mermaid
graph TB
    A[public/textures/rooms/] --> B[walls/white-plaster/]
    A --> C[floors/white-plaster/]
    A --> D[ceilings/]
    
    E[core/types.ts] --> F[RoomTextureSet]
    E --> G[RoomMaterials]
    E --> H[RoomConfiguration]
    
    I[core/libraries/room-texture-library/] --> J[room-texture-library.ts]
    I --> K[texture-loader.ts]
    
    L[app/(app)/(designer)/hooks/] --> M[useRoomMaterials.ts]
    N[app/(app)/(designer)/utils/] --> O[texture-loader.ts]
    
    P[app/(app)/(designer)/components/room.tsx] --> Q[Room Component]
    
    B --> Q
    C --> Q
    D --> Q
    J --> M
    M --> Q
```

## Порядок реализации

### Этап 1: Подготовка структуры
1. **Создать структуру папок** ✅ (частично выполнено)
   - `public/textures/rooms/walls/white-plaster/`
   - `public/textures/rooms/floors/white-plaster/`
   - `public/textures/rooms/ceilings/`

2. **Переместить текстуры** 
   - Выполнить команды из `texture-migration-plan.md`
   - Переименовать файлы в стандартные имена (diffuse, normal, etc.)

### Этап 2: Расширение типов
3. **Обновить core/types.ts**
   - Добавить новые интерфейсы из `core-types-extension-plan.md`
   - Обновить существующие интерфейсы
   - Добавить утилиты для значений по умолчанию

### Этап 3: Создание библиотеки текстур
4. **Создать RoomTextureLibrary**
   - `core/libraries/room-texture-library/room-texture-library.ts`
   - `core/libraries/room-texture-library/texture-loader.ts`
   - `core/libraries/room-texture-library/index.ts`

5. **Реализовать загрузчик текстур**
   - Поддержка PBR текстур
   - Кеширование загруженных текстур
   - Обработка ошибок загрузки

### Этап 4: Хуки и утилиты
6. **Создать хук useRoomMaterials**
   - `app/(app)/(designer)/hooks/useRoomMaterials.ts`
   - Логика создания материалов
   - Кеширование через useMemo

7. **Создать утилиты для загрузки**
   - `app/(app)/(designer)/utils/texture-loader.ts`
   - Функции для асинхронной загрузки текстур

### Этап 5: Модификация компонентов
8. **Обновить компонент Room**
   - Изменить интерфейс компонента
   - Интегрировать useRoomMaterials
   - Сохранить обратную совместимость

### Этап 6: Конфигурация
9. **Создать систему конфигурации**
   - Обновить примеры конфигураций
   - Добавить выбор текстур в интерфейс
   - Создать предустановки материалов

## Файлы для создания/модификации

### Новые файлы:
```
core/libraries/room-texture-library/
├── room-texture-library.ts
├── texture-loader.ts
└── index.ts

app/(app)/(designer)/hooks/
└── useRoomMaterials.ts

app/(app)/(designer)/utils/
└── texture-loader.ts

public/textures/rooms/
├── walls/white-plaster/
│   ├── diffuse.jpg
│   ├── normal.jpg
│   ├── roughness.jpg
│   └── displacement.jpg
└── floors/white-plaster/
    ├── diffuse.jpg
    ├── normal.jpg
    ├── roughness.jpg
    └── displacement.jpg
```

### Модифицируемые файлы:
```
core/types.ts (добавление новых интерфейсов)
app/(app)/(designer)/components/room.tsx (обновление компонента)
core/examples/example-kitchen-config.ts (добавление материалов комнаты)
```

## Тестирование

### Тестовые сценарии:
1. **Обратная совместимость**
   - Компонент Room работает без параметра materials
   - Сохраняются текущие цвета

2. **Загрузка текстур**
   - Текстуры корректно загружаются
   - Обработка ошибок при отсутствующих файлах

3. **Производительность**
   - Текстуры кешируются
   - Нет повторных загрузок

4. **Интерфейс**
   - Выбор текстур работает корректно
   - Предпросмотр в реальном времени

## Результат

После реализации пользователь сможет:
- Выбирать текстуры для стен, пола и потолка
- Настраивать масштаб текстур
- Использовать как текстуры, так и цвета
- Сохранять конфигурации комнат

## Преимущества

1. **Архитектурная чистота**: Следование правилам разработки проекта
2. **Масштабируемость**: Легкое добавление новых текстур
3. **Производительность**: Оптимизированная загрузка и кеширование
4. **UX**: Интуитивный интерфейс выбора материалов
5. **Совместимость**: Сохранение работы существующего кода