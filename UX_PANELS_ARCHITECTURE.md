# UX Panels Architecture

## Directory Structure

```
components/
├── ui/                              # Base shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── select.tsx
│   └── slider.tsx
│
└── panels/                          # Editor UI panels (RECOMMENDED NAME: "panels")
    ├── header-toolbar/              # Top toolbar with menus
    │   └── header-toolbar.tsx
    ├── left-sidebar/                # Left action buttons
    │   └── left-sidebar.tsx
    ├── right-sidebar/               # Right properties panel
    │   └── right-sidebar.tsx
    ├── chat/                        # AI chat interface
    │   └── chat.tsx
    ├── camera-controls/             # 3D camera controls
    │   └── camera-controls.tsx
    ├── dashboard-card/              # Statistics widget
    │   └── dashboard-card.tsx
    ├── index.ts                     # Barrel export
    └── README.md                    # Component documentation
```

## Component Breakdown

### 1. **HeaderToolbar**
- **Location:** `components/panels/header-toolbar/header-toolbar.tsx`
- **Purpose:** Main application toolbar at the top
- **Contains:**
  - Menu buttons (File, Edit, View)
  - Share button with tooltip
  - Save Project button
- **Props:** None (stateless)
- **Usage:**
  ```tsx
  <HeaderToolbar />
  ```

### 2. **LeftSidebar**
- **Location:** `components/panels/left-sidebar/left-sidebar.tsx`
- **Purpose:** Vertical action buttons on left side
- **Contains:**
  - Add Cabinets button
  - Select Finishes button
  - Change Materials button
  - Divider
  - Undo button
  - Redo button
  - All with tooltips
- **Props:** None (stateless)
- **Usage:**
  ```tsx
  <LeftSidebar />
  ```

### 3. **RightSidebar** ⭐ (Interactive)
- **Location:** `components/panels/right-sidebar/right-sidebar.tsx`
- **Purpose:** Properties panel for selected object
- **Contains:**
  - Material selector (Select dropdown)
  - Width slider (30-120cm)
  - Height slider (40-100cm)
- **Props:**
  ```typescript
  interface RightSidebarProps {
    materialSelect: string;
    widthValue: number[];
    heightValue: number[];
    onMaterialChange: (value: string) => void;
    onWidthChange: (value: number[]) => void;
    onHeightChange: (value: number[]) => void;
  }
  ```
- **Usage:**
  ```tsx
  <RightSidebar
    materialSelect={materialSelect}
    widthValue={widthValue}
    heightValue={heightValue}
    onMaterialChange={setMaterialSelect}
    onWidthChange={setWidthValue}
    onHeightChange={setHeightValue}
  />
  ```

### 4. **Chat** ⭐ (Interactive)
- **Location:** `components/panels/chat/chat.tsx`
- **Purpose:** AI assistant chat interface
- **Contains:**
  - Message display area with scrolling
  - AI and user message differentiation
  - Input field with send button
  - Sample conversation history
- **Props:** None (manages own state)
- **Usage:**
  ```tsx
  <Chat />
  ```

### 5. **CameraControls**
- **Location:** `components/panels/camera-controls/camera-controls.tsx`
- **Purpose:** 3D viewport camera manipulation buttons
- **Contains:**
  - Zoom In button
  - Zoom Out button
  - Rotate button
  - Randomize button
  - All with tooltips
- **Props:**
  ```typescript
  interface CameraControlsProps {
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    onRotate?: () => void;
    onRandomize?: () => void;
  }
  ```
- **Usage:**
  ```tsx
  <CameraControls
    onZoomIn={handleZoomIn}
    onZoomOut={handleZoomOut}
    onRotate={handleRotate}
    onRandomize={handleRandomize}
  />
  ```

### 6. **DashboardCard**
- **Location:** `components/panels/dashboard-card/dashboard-card.tsx`
- **Purpose:** Statistics/dashboard information widget
- **Contains:**
  - Dashed border container
  - Placeholder visual elements
  - Glassmorphism styling
- **Props:** None (stateless)
- **Usage:**
  ```tsx
  <DashboardCard />
  ```

## Naming Convention

**Directory Name:** `panels` (recommended)
- ✅ Clear and concise
- ✅ Describes the purpose (editor UI panels)
- ✅ Follows component library naming conventions
- ✅ Singular "panel" + plural "s" = "panels" (collection)

**Alternative names (rejected):**
- ❌ `interface` - Too generic, unclear
- ❌ `editor-components` - Too verbose
- ❌ `widgets` - Doesn't convey panel layout concept
- ❌ `ui-panels` - Redundant with "ui" folder

## File Organization Pattern

Each panel follows this pattern:
```
panel-name/
├── panel-name.tsx          # Main component
└── (optional)
    ├── index.ts            # Optional barrel export
    ├── constants.ts        # Component constants
    └── types.ts            # Component types
```

## Barrel Export

**File:** `components/panels/index.ts`

Allows clean imports:
```typescript
// ✅ Good
import {
  Chat,
  HeaderToolbar,
  LeftSidebar,
  RightSidebar,
  CameraControls,
  DashboardCard,
} from "@/components/panels";

// ❌ Avoid
import { Chat } from "@/components/panels/chat/chat";
```

## Usage in Page

**File:** `app/(app)/ux/page.tsx`

```typescript
"use client";

import React, { useState } from "react";
import {
  HeaderToolbar,
  LeftSidebar,
  RightSidebar,
  CameraControls,
  DashboardCard,
  Chat,
} from "@/components/panels";

export default function UXTestPage() {
  const [materialSelect, setMaterialSelect] = useState("dark-oak");
  const [widthValue, setWidthValue] = useState([60]);
  const [heightValue, setHeightValue] = useState([80]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center">
        {/* Kitchen render image */}
      </div>

      {/* Header */}
      <HeaderToolbar />

      {/* Left */}
      <LeftSidebar />

      {/* Right */}
      <RightSidebar
        materialSelect={materialSelect}
        widthValue={widthValue}
        heightValue={heightValue}
        onMaterialChange={setMaterialSelect}
        onWidthChange={setWidthValue}
        onHeightChange={setHeightValue}
      />

      {/* Footer */}
      <footer>
        <DashboardCard />
        <Chat />
        <CameraControls />
      </footer>
    </div>
  );
}
```

## Styling Approach

### Theme Integration
- ✅ Uses Tailwind theme tokens (CSS variables)
- ✅ `ux-glass` class for glassmorphism
- ✅ `primary`, `foreground`, `border` colors from theme
- ✅ Dark mode support built-in

### Key Classes Used
```css
.ux-glass              /* Glassmorphism effect */
.bg-background         /* Background color from theme */
.text-foreground       /* Text color from theme */
.bg-primary            /* Primary action color */
.rounded-lg            /* Rounded corners */
.p-4                   /* Padding */
.shadow-lg             /* Shadow effect */
```

## Component Composition

### State Management
- **Stateless Components:** HeaderToolbar, LeftSidebar, CameraControls, DashboardCard
- **Semi-Stateful:** RightSidebar (accepts props + callbacks)
- **Stateful:** Chat (manages own message state)
- **Page Level:** UX page manages overall state and passes down

### Data Flow
```
UXPage (state)
  ├── HeaderToolbar (display only)
  ├── LeftSidebar (display only)
  ├── RightSidebar (props + callbacks)
  ├── Footer
  │   ├── DashboardCard (display only)
  │   ├── Chat (self-managed state)
  │   └── CameraControls (props + callbacks)
```

## Future Enhancements

1. **Extract Chat State** - Move to page level for integration with backend
2. **Add Configuration** - Allow customizing button actions
3. **Add Icons** - Replace SVGs with lucide-react icons
4. **Responsive Design** - Add mobile/tablet layouts
5. **Animation** - Add entrance animations for panels
6. **Persistence** - Save panel states to localStorage
7. **Panel Resizing** - Make panels draggable/resizable
8. **Keyboard Shortcuts** - Show in tooltips and implement

## Benefits of This Architecture

✅ **Modularity** - Each panel is independent and reusable
✅ **Maintainability** - Easy to find and modify specific panels
✅ **Scalability** - Easy to add new panels following the same pattern
✅ **Testing** - Each component can be tested independently
✅ **Reusability** - Panels can be used in other pages
✅ **Type Safety** - Props are fully typed with TypeScript
✅ **Performance** - No unnecessary re-renders with proper memoization
✅ **Accessibility** - Built-in support for keyboard navigation and tooltips

