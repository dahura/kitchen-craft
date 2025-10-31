# Kitchen Module Builders

This directory contains builders for rendering kitchen modules in 3D using Three.js and React Three Fiber.

## Architecture

### Geometry Generator (`geometry-generator.ts`)

The core geometry generation utility that converts `RenderableModule[]` into Three.js meshes. This is a **framework-agnostic** utility that works with pure Three.js.

**Key Features:**
- ✅ Reusable geometry helpers (`createBoxGeometry`, `createPlaneGeometry`, `createCylinderGeometry`)
- ✅ UV mapping utilities (`applyUV`)
- ✅ Material conversion from `MaterialDefinition` to Three.js materials
- ✅ Complete module geometry generation from `RenderableModule`
- ✅ Memory management utilities (`disposeGeometry`)
- ✅ Bounding box calculations

**Usage:**

```typescript
import { generateModuleGeometry, createMeshesFromGeometryData } from './geometry-generator';

// Generate geometry data
const geometryData = generateModuleGeometry(renderableModule);

// Convert to Three.js meshes
const meshGroup = createMeshesFromGeometryData(
  geometryData,
  module.position,
  module.rotation
);

// Add to scene
scene.add(meshGroup);

// Cleanup when done
disposeGeometry(meshGroup);
```

### React Components

#### 1. **BaseCabinet** (`base-cabinet.tsx`)
Original React Three Fiber component using `@react-three/drei` components.
- Uses declarative JSX approach
- Built with `<Box>` components
- Good for rapid prototyping

#### 2. **GeometryBasedCabinet** (`geometry-based-cabinet.tsx`)
Example component demonstrating integration with the geometry generator.
- Uses `geometry-generator` utilities
- Supports interactivity (hover, click)
- More performant for complex scenes
- Better memory management

**Usage:**

```typescript
import { GeometryBasedCabinet } from './builders/geometry-based-cabinet';

<GeometryBasedCabinet 
  module={renderableModule}
  interactive={true}
  onHover={(hovered) => console.log('Hovered:', hovered)}
  onClick={() => console.log('Clicked!')}
/>
```

#### 3. **Carcass** (`carcass.tsx`)
Specialized component for rendering cabinet carcass (frame/box structure).

#### 4. **Plinth** (`plinth.tsx`)
Component for rendering kitchen plinth/toe kick.

## When to Use What?

### Use `geometry-generator.ts` directly when:
- Building vanilla Three.js applications
- Need maximum performance
- Working outside React
- Implementing custom rendering pipelines
- Building non-interactive visualizations

### Use React components (`GeometryBasedCabinet`, `BaseCabinet`) when:
- Building with React Three Fiber
- Need interactivity (hover, click, drag)
- Want declarative component composition
- Leveraging React's lifecycle and state management

## Examples

See `geometry-generator.example.ts` for comprehensive examples including:
1. Basic geometry creation
2. Material creation
3. Complete module generation
4. Kitchen scene generation
5. Memory management
6. Bounding box calculations
7. Complete Three.js setup
8. Performance optimization with instancing

## Data Flow

```
KitchenConfig
    ↓
ValidationEngine
    ↓
LayoutEngine
    ↓
RenderableModule[]
    ↓
geometry-generator.ts → ModuleGeometryData → Three.js Meshes
    ↓
React Three Fiber Components (optional)
    ↓
Rendered 3D Scene
```

## Performance Tips

1. **Use `useMemo`** to cache geometry generation:
```typescript
const geometryData = useMemo(() => 
  generateModuleGeometry(module), 
  [module]
);
```

2. **Dispose of geometries** when components unmount:
```typescript
useEffect(() => {
  return () => disposeGeometry(meshGroup);
}, [meshGroup]);
```

3. **Use instancing** for repeated elements (handles, knobs):
```typescript
const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
```

4. **Optimize materials** - reuse materials across meshes:
```typescript
const sharedMaterial = createColorMaterial('#2C3E50', 0.2, 0.1);
// Use same material for multiple meshes
```

## Testing

Run the examples to verify geometry generation:

```typescript
import { runAllExamples } from './geometry-generator.example';

runAllExamples(); // Logs results to console
```

## Contributing

When adding new builders:
1. Follow the existing patterns
2. Add TypeScript types
3. Include examples in the example file
4. Add documentation here
5. Ensure proper cleanup/disposal

## Related Files

- `/core/types.ts` - Type definitions for `RenderableModule`, `MaterialDefinition`, etc.
- `/core/engines/layout-engine/layout-engine.ts` - Generates `RenderableModule[]`
- `/core/libraries/material-library/material-library.ts` - Material definitions
