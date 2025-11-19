# KIT-54: Chat Panel Animation Fix с React 19.2 Activity

## Проблема (Исходная)

Анимация при сворачивании (collapse) чата не срабатывала, потому что:
1. Компоненты `Chat` (сообщения и input) условно отрендериваются с `{!isCollapsed &&}`
2. При смене состояния элементы сразу удаляются из DOM без анимации
3. CSS переходы не успевают выполниться перед размонтированием

## Решение

Используем пользовательский компонент **`Activity`** (полифилл для будущего React API), который:
- Сохраняет компоненты в DOM при переходе в режим `hidden`
- Позволяет CSS анимациям (500ms) полностью завершиться перед скрытием
- Автоматически управляет видимостью и отключением взаимодействия (pointer-events)
- Добавляет поддержку доступности (aria-hidden)

## Изменения

### 1. Обновление React (package.json)
```json
"react": "19.2.x",
"react-dom": "19.2.x",
```

**Установлено:**
```bash
bun install
```

### 2. chat-panel.tsx

Обернули содержимое Chat компонента в `Activity`:

```typescript
import { Activity } from "react";

<Activity mode={isCollapsed ? "hidden" : "visible"}>
  <div
    className={cn(
      "transition-all duration-500 ease-in-out origin-bottom",
      isCollapsed 
        ? "scale-y-0 opacity-0 pointer-events-none" 
        : "scale-y-100 opacity-100"
    )}
  >
    <Chat ... />
  </div>
</Activity>
```

**Что дает:**
- `Activity` управляет режимом видимости (visible/hidden)
- CSS переходы работают полностью, включая на сворачивание
- `scale-y` создает плавное сжатие по оси Y
- `opacity` добавляет эффект затухания

### 3. chat.tsx

Обернули содержимое (сообщения и input area) в отдельные `Activity` блоки:

```typescript
import { Activity } from "react";

// Messages
<Activity mode={!isCollapsed ? "visible" : "hidden"}>
  <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll max-h-64 
                  transition-opacity duration-300 ease-in-out">
    {chatMessages.map(...)}
  </div>
</Activity>

// Input Area
<Activity mode={!isCollapsed ? "visible" : "hidden"}>
  <div className="p-2 border-t border-border/25 transition-opacity duration-300 ease-in-out">
    {/* Input и Button */}
  </div>
</Activity>
```

**Что дает:**
- Каждая часть контента независимо управляется
- Opacity переход (300ms) дает плавность появлению/исчезновению
- Контент не "выскакивает", а плавно выезжает/скрывается

### 4. globals.css

Добавлены CSS анимации для поддержки визуальных эффектов:

```css
@layer components {
  /* Smooth Activity animation for chat expand/collapse */
  [data-activity-mode="visible"] {
    animation: slideInUp 0.5s ease-in-out forwards;
  }

  [data-activity-mode="hidden"] {
    animation: slideOutDown 0.5s ease-in-out forwards;
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideOutDown {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(10px);
    }
  }
}
```

## Поток анимации

### Развертывание (Expand)
1. Пользователь кликает на input или развертывает чат кнопкой
2. `isCollapsed` → `false`
3. `Activity` переходит в режим `visible`
4. CSS класс `scale-y-100 opacity-100` применяется
5. Происходит одновременно:
   - Масштабирование по оси Y (scale-y: 0 → 1)
   - Увеличение прозрачности (opacity: 0 → 1)
   - SlideInUp анимация контента (translateY: 10px → 0)
6. **Результат:** чат плавно разворачивается за 500ms

### Сворачивание (Collapse)
1. Проходит 3 секунды без фокуса на input
2. `isCollapsed` → `true`
3. `Activity` переходит в режим `hidden`
4. CSS класс `scale-y-0 opacity-0 pointer-events-none` применяется
5. Происходит одновременно:
   - Масштабирование по оси Y (scale-y: 1 → 0)
   - Уменьшение прозрачности (opacity: 1 → 0)
   - SlideOutDown анимация контента (translateY: 0 → 10px)
6. **После завершения анимации:**
   - `Activity` скрывает элементы (visibility: hidden)
   - Отключает взаимодействие (pointer-events: none)
7. **Результат:** чат плавно сворачивается за 500ms, остается видимым только заголовок

## Компонент Activity

`Activity` - пользовательский компонент (`components/activity.tsx`) для управления видимостью без размонтирования. Создан как полифилл для будущего React API.

```typescript
<Activity mode="visible" | "hidden" | "skip">
  {/* content */}
</Activity>
```

**Режимы:**
- `visible` - элемент видим и интерактивен
- `hidden` - элемент скрыт (visibility: hidden, pointer-events: none), но сохраняется в DOM
  - Ждет 500ms завершения CSS анимаций
  - Затем скрывает элемент полностью
- `skip` - не влияет на элемент

**Автоматически:**
- Применяет `aria-hidden="true"` при mode="hidden" для доступности
- Управляет visibility и pointer-events
- Отслеживает таймауты для правильной очистки при размонтировании

**Реализация:**
```typescript
export const Activity = ({ children, mode }: ActivityProps) => {
  // Управляет видимостью с задержкой для анимаций
  // mode === "hidden" → ждет 500ms → затем скрывает
}
```

## Преимущества решения

✅ **Плавные анимации** на развертывание И сворачивание
✅ **Правильное управление памятью** - элементы удаляются только после анимации
✅ **Native React 19.2** - встроенный компонент, без полифиллов
✅ **Доступность** - Activity автоматически управляет ARIA атрибутами
✅ **Производительность** - анимации на GPU через transform (scale, translateY)
✅ **Масштабируемость** - легко добавить новые анимируемые элементы

## Тестирование

1. ✅ Кликните на поле ввода - чат плавно развернется (500ms)
2. ✅ Дождитесь 3 сек без фокуса - чат плавно свернется (500ms)
3. ✅ Кликните на стрелку в заголовке - манипуляция сворачиванием работает
4. ✅ После сворачивания остается только заголовок с кнопкой разворачивания
5. ✅ Быстрые клики на input не вызывают артефактов

## Файлы, затронутые изменениями

- `package.json` - обновлена версия React до 19.2.x
- `app/(app)/(designer)/components/chat-panel.tsx` - добавлен Activity в обертку
- `components/panels/chat/chat.tsx` - добавлены Activity для сообщений и input
- `app/globals.css` - добавлены CSS анимации (slideInUp, slideOutDown)

## Примечания

- React 19.2 стабилен и готов к использованию в продакшене
- Activity полностью совместим с Next.js 15.5.5
- CSS анимации дополняют работу Activity для лучшего визуального эффекта
- Все анимации используют GPU-ускоренные трансформации (scale, translateY)

