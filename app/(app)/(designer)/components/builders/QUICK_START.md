# Geometry Generator - Quick Start Guide

## 🚀 Quick Start

### 1. Using in Vanilla Three.js

```typescript
import * as THREE from 'three';
import { generateScene } from './geometry-generator';
import type { RenderableModule } from '../../../../../core/types';

// Your renderable modules from layout engine
const modules: RenderableModule[] = [...];

// Generate complete scene
const kitchenGroup = generateScene(modules);

// Add to your scene
scene.add(kitchenGroup);

// Cleanup when done
import { disposeGeometry } from './geometry-generator';
disposeGeometry(kitchenGroup);
```

### 2. Using in React Three Fiber

```typescript
import { GeometryBasedCabinet } from './geometry-based-cabinet';

function MyKitchen() {
  return (
    <>
      {modules.map(module => (
        <GeometryBasedCabinet
          key={module.id}
          module={module}
          interactive={true}
          onHover={(hovered) => console.log('Hovered:', hovered)}
          onClick={() => console.log('Clicked!')}
        />
      ))}
    </>
  );
}
```

### 3. Creating Custom Geometries

```typescript
import {
  createBoxGeometry,
  createPlaneGeometry,
  createColorMaterial,
} from './geometry-generator';
import * as THREE from 'three';

// Box with UV tiling
const box = createBoxGeometry(100, 80, 60, { u: 2, v: 2 });
const material = createColorMaterial('#3498db', 0.3, 0.0);
const mesh = new THREE.Mesh(box, material);
```

## 📁 File Structure

```
builders/
├── geometry-generator.ts          # Core utilities (568 lines)
├── geometry-generator.example.ts  # 8 examples (457 lines)
├── geometry-based-cabinet.tsx     # React integration (185 lines)
├── geometry-generator.test.tsx    # Test scene (296 lines)
├── README.md                      # Full documentation (171 lines)
└── QUICK_START.md                # This file
```

## 🎯 What's Included

### Core Functions (`geometry-generator.ts`)

**Geometry Helpers:**
- `createBoxGeometry()` - Box with UV scaling
- `createPlaneGeometry()` - Plane with UV scaling
- `createCylinderGeometry()` - Cylinders
- `applyUV()` - Apply UV coordinates

**Material Helpers:**
- `createMaterialFromDefinition()` - Convert MaterialDefinition → Three.js
- `createColorMaterial()` - Quick colored materials

**Module Generation:**
- `generateModuleGeometry()` - RenderableModule → GeometryData
- `generateCarcassGeometry()` - Cabinet frames
- `generateDrawerGeometry()` - Drawers
- `generateDoorGeometry()` - Doors
- `generateShelfGeometry()` - Shelves
- `generateScene()` - Complete scene generation

**Utilities:**
- `disposeGeometry()` - Memory cleanup
- `calculateBoundingBox()` - Bounding box calculation

### React Components (`geometry-based-cabinet.tsx`)

- `GeometryBasedCabinet` - Full-featured interactive
- `SimpleGeometryBasedCabinet` - Non-interactive
- `OptimizedGeometryBasedCabinet` - Memoized

## 🧪 Testing

### Run Test Scene

```typescript
import GeometryGeneratorTestScene from './geometry-generator.test';

// In your page/component:
<GeometryGeneratorTestScene />
```

### Run Examples

```typescript
import { runAllExamples } from './geometry-generator.example';

runAllExamples(); // Console output with validation
```

## ⚡ Performance Tips

1. **Cache Geometry:**
```typescript
const geometryData = useMemo(() => 
  generateModuleGeometry(module), 
  [module]
);
```

2. **Dispose Properly:**
```typescript
useEffect(() => {
  return () => disposeGeometry(meshGroup);
}, [meshGroup]);
```

3. **Reuse Materials:**
```typescript
const sharedMaterial = createColorMaterial('#2C3E50', 0.2, 0.1);
// Use for multiple meshes
```

4. **Use Instancing for Repeated Elements:**
```typescript
const instancedMesh = new THREE.InstancedMesh(
  geometry, material, count
);
```

## 🎨 Examples Preview

### Example 1: Basic Cabinet
```typescript
import { exampleBaseCabinet } from './geometry-generator.example';
const cabinet = exampleBaseCabinet();
scene.add(cabinet);
```

### Example 2: Complete Kitchen
```typescript
import { exampleKitchenScene } from './geometry-generator.example';
const kitchen = exampleKitchenScene();
scene.add(kitchen);
```

### Example 3: Material Creation
```typescript
import { exampleMaterialCreation } from './geometry-generator.example';
const materials = exampleMaterialCreation();
// Array of Three.js materials ready to use
```

## 📊 Key Statistics

- **Total Lines of Code:** 1,677
- **File Size:** ~41KB
- **Functions:** 20+
- **Examples:** 8 complete scenarios
- **Test Components:** 3 variants
- **Documentation:** Comprehensive JSDoc + README

## 🔗 Related Files

- `/core/types.ts` - Type definitions
- `/core/engines/layout-engine/layout-engine.ts` - Generates RenderableModule[]
- `/core/libraries/material-library/material-library.ts` - Material definitions

## 🤝 Integration Points

Works seamlessly with:
- ✅ Layout Engine output
- ✅ Material Library
- ✅ Existing builders (base-cabinet.tsx, carcass.tsx)
- ✅ Kitchen Store
- ✅ React Three Fiber
- ✅ Vanilla Three.js

## 📖 More Resources

- **Full Documentation:** `README.md` in this directory
- **Complete Examples:** `geometry-generator.example.ts`
- **Test Scene:** `geometry-generator.test.tsx`
- **Implementation Details:** `/workspace/GEOMETRY_GENERATOR_IMPLEMENTATION.md`

## 🎉 You're Ready!

The geometry generator is production-ready. Pick your integration approach:

1. **Vanilla Three.js** → Use `generateScene()` directly
2. **React Three Fiber** → Use `GeometryBasedCabinet` components
3. **Custom** → Use individual helpers to build your own

Happy coding! 🚀
