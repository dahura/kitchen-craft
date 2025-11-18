# Panels Component Library

## Overview

The `panels` directory contains all UI panel components used in the 3D Kitchen Editor interface. These are the main visual sections that make up the editor layout.

## Directory Structure

```
panels/
├── chat/                      # AI chat interface
│   └── chat.tsx              # Chat panel with messages and input
├── header-toolbar/            # Top navigation bar
│   └── header-toolbar.tsx     # Menu buttons and actions
├── left-sidebar/              # Action buttons sidebar
│   └── left-sidebar.tsx       # Editor action buttons (Add, Edit, Undo, etc)
├── right-sidebar/             # Properties panel
│   └── right-sidebar.tsx      # Material, dimensions, and property controls
├── camera-controls/           # 3D camera interaction buttons
│   └── camera-controls.tsx    # Zoom, rotate, randomize controls
├── dashboard-card/            # Statistics widget
│   └── dashboard-card.tsx     # Dashboard information display
├── index.ts                   # Barrel export for all panels
└── README.md                  # This file
```

## Components

### HeaderToolbar
Located in `header-toolbar/`

Main application toolbar with menu options and primary actions.

**Props:** None (stateless)

**Features:**
- File, Edit, View menus
- Share button with tooltip
- Save Project button

### LeftSidebar
Located in `left-sidebar/`

Action buttons sidebar for editor operations.

**Props:** None (stateless)

**Features:**
- Add Cabinets button
- Select Finishes button
- Change Materials button
- Undo/Redo buttons
- Icon buttons with tooltips

### RightSidebar
Located in `right-sidebar/`

Properties panel for adjusting selected objects.

**Props:**
- `materialSelect: string` - Selected material value
- `widthValue: number[]` - Current width value
- `heightValue: number[]` - Current height value
- `onMaterialChange: (value: string) => void` - Material selection handler
- `onWidthChange: (value: number[]) => void` - Width change handler
- `onHeightChange: (value: number[]) => void` - Height change handler

**Features:**
- Material selector dropdown
- Width slider (30-120cm)
- Height slider (40-100cm)

### Chat
Located in `chat/`

AI assistant chat interface.

**Props:** None (manages own state)

**Features:**
- Message display with AI and user differentiation
- Message history
- Input field with send button
- Auto-scroll to latest messages
- Enter key to send

### CameraControls
Located in `camera-controls/`

3D viewport camera control buttons.

**Props:**
- `onZoomIn?: () => void` - Zoom in callback
- `onZoomOut?: () => void` - Zoom out callback
- `onRotate?: () => void` - Rotate callback
- `onRandomize?: () => void` - Randomize callback

**Features:**
- Four control buttons with tooltips
- Icon buttons for camera manipulation

### DashboardCard
Located in `dashboard-card/`

Statistics/dashboard information widget.

**Props:** None (stateless)

**Features:**
- Dashed border container
- Placeholder for dashboard data
- Glassmorphism styling

## Usage

### Individual Import
```typescript
import { Chat } from "@/components/panels/chat/chat";
import { HeaderToolbar } from "@/components/panels/header-toolbar/header-toolbar";
```

### Barrel Import
```typescript
import {
  Chat,
  HeaderToolbar,
  LeftSidebar,
  RightSidebar,
  CameraControls,
  DashboardCard,
} from "@/components/panels";
```

## Styling

All panels use:
- **Tailwind CSS** for styling
- **Theme tokens** from CSS variables (`primary`, `foreground`, `border`, etc.)
- **ux-glass** class for glassmorphism effects
- **Responsive design** considerations

## Accessibility

- Buttons have proper ARIA labels via tooltips
- Keyboard navigation support
- High contrast colors for visibility
- Semantic HTML structure

## Future Enhancements

- [ ] Add keyboard shortcuts display in tooltips
- [ ] Implement panel resizing/docking
- [ ] Add panel animations on open/close
- [ ] Create panel configuration system
- [ ] Add panel state persistence (localStorage)

