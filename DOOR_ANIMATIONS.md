# Door Animation System

This document describes the door animation system implemented for Kitchen-Craft, providing interactive door opening/closing animations with cube-based pivot mechanisms.

## Overview

The door animation system consists of:
- **Animation utilities** (`lib/animations.ts`) - Core easing functions and animation controller
- **Animated door components** (`app/(app)/(designer)/components/builders/animated-door.tsx`) - React components for interactive doors
- **Updated cabinet builders** - Integration with existing cabinet components

## Features

### ✅ Implemented Features

1. **Cube-based Pivot Mechanism**: Doors rotate around a visible cube that acts as the hinge point
2. **Multiple Easing Functions**: 
   - `easeInOutCubic` - Smooth acceleration/deceleration
   - `easeOutElastic` - Elastic bounce effect
   - `easeOutBounce` - Bouncing effect
3. **Sound Effects**: Audio feedback timed with animations (opening/closing sounds)
4. **Interactive Controls**: Click to toggle, hover effects, visual feedback
5. **Configurable Animations**: Customizable duration, easing, and open angles
6. **Single and Double Doors**: Support for both single doors and double door configurations with synchronized animation
7. **Drawer Animations**: Animated drawer opening/closing with Promise-based API
8. **Sound System**: Enhanced sound management with timed sound effects (sounds play before animation ends)
9. **Cabinet Integration**: Automatic integration with base, upper, and tall cabinets

### 🎯 Animation Configuration

```typescript
interface DoorAnimationConfig {
  openAngle: number;     // Maximum open angle in radians (default: π/2)
  duration: number;      // Animation duration in milliseconds (default: 800ms)
  easing: (t: number) => number; // Easing function (default: easeInOutCubic)
  playSound?: boolean;   // Whether to play sound effects (default: true)
}
```

## Usage

### Basic AnimatedDoor Component

```tsx
import { AnimatedDoor } from './builders/animated-door';

<AnimatedDoor
  width={50}
  height={70}
  depth={2}
  position={[0, 0, 0]}
  color="#8B7355"
  config={{
    openAngle: Math.PI / 2,
    duration: 800,
    easing: easeInOutCubic,
    playSound: true,
  }}
  onClick={() => console.log('Door clicked!')}
/>
```

### Double Door Configuration

The `DoubleDoor` component uses `DoubleDoorAnimationController` for synchronized left/right door control:

```tsx
import { DoubleDoor } from './builders/animated-door';

<DoubleDoor
  width={100}
  height={70}
  depth={2}
  position={[0, 0, 0]}
  color="#8B7355"
  gap={2}
  config={{
    openAngle: Math.PI / 2,  // 90 degrees
    duration: 1000,           // 1000ms as in Svelte example
    easing: easeInOutCubic,
    playSound: true,
  }}
/>
```

**Features:**
- Left door rotates negative (-MAX_ROTATION) when opening
- Right door rotates positive (+MAX_ROTATION) when opening
- Each door can be clicked independently
- Uses `useFrame` for smooth 60fps updates
- Proper pivot points at door edges

### Using the Animation Hook

```tsx
import { useDoorAnimation } from './builders/animated-door';

const MyComponent = () => {
  const { state, toggle, open, close } = useDoorAnimation({
    duration: 600,
    openAngle: Math.PI / 3,
  });

  return (
    <div>
      <p>Door is {state.isOpen ? 'open' : 'closed'}</p>
      <p>Animation: {state.isAnimating ? 'running' : 'idle'}</p>
      <button onClick={toggle}>Toggle Door</button>
      <button onClick={open}>Open Door</button>
      <button onClick={close}>Close Door</button>
    </div>
  );
};
```

## Technical Implementation

### Animation Controllers

#### Single Door Controller

The `DoorAnimationController` class manages single door state and animations:

```typescript
const controller = new DoorAnimationController(config, onStateChange);

// Methods
controller.toggle(): // Toggle between open/closed
controller.open();   // Open the door
controller.close();  // Close the door
controller.getState(); // Get current animation state
controller.dispose(); // Clean up resources
```

#### Double Door Controller

The `DoubleDoorAnimationController` manages synchronized left/right doors:

```typescript
const controller = new DoubleDoorAnimationController(config, onStateChange);

// Methods
controller.toggleLeft();  // Toggle left door (opens negative rotation)
controller.toggleRight(); // Toggle right door (opens positive rotation)
controller.getState();    // Get state for both doors
controller.dispose();     // Clean up resources

// State structure
interface DoubleDoorAnimationState {
  leftDoor: {
    isOpen: boolean;
    isAnimating: boolean;
    rotation: number; // Negative when opening (e.g., -π/2)
  };
  rightDoor: {
    isOpen: boolean;
    isAnimating: boolean;
    rotation: number; // Positive when opening (e.g., +π/2)
  };
}
```

#### Drawer Controller

The `DrawerAnimationController` manages drawer slide animations:

```typescript
const controller = new DrawerAnimationController(config);

// Methods
controller.toggleDrawer({ from, to, onUpdate }): Promise<void>
controller.getPosition(): number // Current drawer position
```

### Cube-based Pivot Mechanism

Each animated door uses a small cube positioned at the hinge point:
- **Visual Feedback**: The cube changes color during animation (gold when animating)
- **Interaction Target**: Click the cube or door to trigger animation
- **Rotation Axis**: The door rotates around the cube's position
- **Hover Effects**: The cube scales up when hovered

### Sound System

Enhanced sound management with `SoundManager` class:

```typescript
import { soundManager } from '@/lib/animations';

// Load sounds (should be done during app initialization)
soundManager.loadSound('doorOpen', '/sounds/door-open.mp3');
soundManager.loadSound('doorClose', '/sounds/door-close.mp3');
soundManager.loadSound('drawerOpen', '/sounds/drawer-open.mp3');
soundManager.loadSound('drawerClose', '/sounds/drawer-close.mp3');

// Play sounds
soundManager.playSound('doorClose');
```

**Sound Timing:**
- Opening sounds: Play at animation start
- Closing sounds: Play slightly before animation ends (100ms offset)
- Drawer sounds: Play before animation ends based on sound duration

**Configuration:**
```typescript
const SOUND_DURATION = 100;
const SOUND_DELAY = 0;
const SOUND_START_OFFSET = ANIMATION_DURATION - (SOUND_DURATION - SOUND_DELAY);
```

**Features:**
- HTML5 Audio API for real sound files (when loaded)
- Automatic sound file loading and caching
- Graceful degradation if audio unavailable
- Timing synchronized with animations

## Cabinet Integration

### Automatic Door Selection

The system automatically chooses between single and double doors based on cabinet width:

```typescript
const useDoubleDoor = doorWidth > 60; // Use double door for wide cabinets
```

### Cabinet-Specific Configurations

Different cabinet types have optimized configurations:

- **Base Cabinets**: Full 90° opening angle, 800ms duration
- **Upper Cabinets**: Reduced 60° angle to avoid head bumping, 600ms duration  
- **Tall Cabinets**: Moderate 72° angle, slower 1000ms duration for tall doors

### Material Integration

Doors automatically use the cabinet's facade material:

```typescript
color={module.materials.facade?.color || "#8B7355"}
```

## Performance Considerations

### Optimizations Implemented

1. **React.memo**: Components are memoized to prevent unnecessary re-renders
2. **useMemo**: Expensive calculations are memoized
3. **useFrame**: Smooth 60fps animation updates via React Three Fiber
4. **Resource Cleanup**: Proper disposal of animation controllers and audio contexts
5. **Batch Updates**: State changes are batched for performance
6. **Ref-based Rotation Updates**: Rotation values stored in refs for synchronous access in `useFrame`, avoiding stale closure issues (see KIT-32)

### Memory Management

```typescript
// Cleanup on component unmount
useEffect(() => {
  return () => {
    controller.dispose();
  };
}, [controller]);
```

## Testing

Comprehensive test coverage includes:

### Animation Utilities Tests (`lib/animations.test.ts`)
- Pattern matching functionality
- Easing function correctness
- Animation timing and progression
- Controller state management
- Audio context handling

### Component Tests (`animated-door.test.tsx`)
- Component rendering
- User interaction handling
- Hook functionality
- Configuration application
- Integration testing

### Running Tests

```bash
bun test lib/animations.test.ts
bun test app/(app)/(designer)/components/builders/animated-door.test.tsx
```

## Architecture Compliance

The implementation follows Kitchen-Craft architecture principles:

### ✅ Core Layer Separation
- Animation utilities in `lib/` are framework-agnostic
- No React dependencies in core animation logic
- Pure functions for easing and pattern matching

### ✅ UI Layer Integration
- React components in `app/` layer only
- Proper use of Three.js and React Three Fiber
- Follows existing builder component patterns

### ✅ Performance Guidelines
- Memoized components and calculations
- Efficient animation loops
- Proper resource cleanup

### ✅ Type Safety
- Full TypeScript coverage
- Proper interface definitions
- Type-safe configuration objects

### Drawer Animation

The drawer animation system provides Promise-based drawer opening/closing:

```typescript
import { DrawerAnimationController, DEFAULT_DRAWER_CONFIG } from '@/lib/animations';

const drawerController = new DrawerAnimationController({
  duration: 1140,  // Default duration
  easing: easeInOutCubic,
  playSound: true,
});

// Toggle drawer with Promise
await drawerController.toggleDrawer({
  from: 0,  // Closed position
  to: 50,   // Open position (distance in mm or units)
  onUpdate: (position) => {
    // Update drawer mesh position
    drawerMeshRef.current.position.z = position;
  },
});
```

**Drawer Animation Features:**
- Promise-based API for async animation handling
- Sound effects with proper timing (before animation ends)
- Configurable duration and easing
- Smooth position updates via callback
- Automatic sound selection (opening vs closing)

**Usage in Components:**

```tsx
import { useRef, useState } from 'react';
import { DrawerAnimationController } from '@/lib/animations';

const DrawerComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef(null);
  const controllerRef = useRef(new DrawerAnimationController());

  const toggleDrawer = async () => {
    await controllerRef.current.toggleDrawer({
      from: isOpen ? 50 : 0,
      to: isOpen ? 0 : 50,
      onUpdate: (pos) => {
        if (drawerRef.current) {
          drawerRef.current.position.z = pos;
        }
      },
    });
    setIsOpen(!isOpen);
  };

  return (
    <mesh ref={drawerRef} onClick={toggleDrawer}>
      {/* Drawer geometry */}
    </mesh>
  );
};
```

## Future Enhancements

### Potential Improvements
1. **Physics Integration**: Add realistic physics simulation for door movement
2. **Collision Detection**: Prevent doors from opening into obstacles
3. **Animation Presets**: Pre-defined animation styles (smooth, snappy, elastic)
4. **Accessibility**: Keyboard navigation and screen reader support
5. **Performance Metrics**: Animation performance monitoring
6. **Visual Effects**: Particle effects, shadows, reflections

### Configuration Extensions
```typescript
interface ExtendedDoorConfig extends DoorAnimationConfig {
  physics?: {
    mass: number;
    friction: number;
    springConstant: number;
  };
  accessibility?: {
    keyboardControl: boolean;
    announceState: boolean;
  };
  effects?: {
    shadows: boolean;
    particles: boolean;
    reflections: boolean;
  };
}
```

## Troubleshooting

### Common Issues

1. **Audio Not Playing**
   - Check browser audio policy (requires user interaction)
   - Verify Web Audio API support
   - Check console for audio context errors

2. **Animations Not Smooth**
   - Verify requestAnimationFrame is available
   - Check for performance bottlenecks in React DevTools
   - Ensure proper memoization of components

3. **Doors Not Responding to Clicks**
   - Verify event propagation is not stopped elsewhere
   - Check Three.js raycasting setup
   - Ensure proper mesh positioning

4. **Visual Rotation Not Working (Fixed in KIT-32)**
   - **Issue**: Doors play sound but don't visually rotate
   - **Root Cause**: `useFrame` was reading stale `animationState.rotation` from closure before React state updates
   - **Solution**: Use refs (`rotationRef`) to store current rotation values that update synchronously with animation callbacks
   - **Implementation**: Both `AnimatedDoor` and `DoubleDoor` now use refs for rotation values accessed in `useFrame`
   - **Files Modified**: `app/(app)/(designer)/components/builders/animated-door.tsx`

### Debug Mode

Enable debug logging by setting:
```typescript
const controller = new DoorAnimationController({
  ...config,
  debug: true, // Enable debug logging
});
```

## Contributing

When extending the door animation system:

1. **Follow Architecture**: Maintain separation between core logic and UI components
2. **Add Tests**: Include unit tests for new functionality
3. **Update Documentation**: Keep this document current with changes
4. **Performance**: Profile new features for performance impact
5. **Accessibility**: Consider accessibility implications of new features

## Related Files

- `lib/animations.ts` - Core animation utilities, controllers, and sound system
  - `DoorAnimationController` - Single door animation
  - `DoubleDoorAnimationController` - Double door animation (left/right)
  - `DrawerAnimationController` - Drawer slide animation
  - `SoundManager` - Sound loading and playback
- `lib/animations.test.ts` - Animation utility tests
- `app/(app)/(designer)/components/builders/animated-door.tsx` - Door components
  - `AnimatedDoor` - Single door component
  - `DoubleDoor` - Double door component with synchronized animations
- `app/(app)/(designer)/components/builders/animated-door.test.tsx` - Component tests
- `app/(app)/(designer)/components/builders/base-cabinet.tsx` - Updated base cabinet
- `app/(app)/(designer)/components/builders/upper-cabinet.tsx` - Updated upper cabinet
- `app/(app)/(designer)/components/builders/tall-cabinet.tsx` - Updated tall cabinet

## Sound Files Setup

To enable sound effects, add sound files to your `public/sounds/` directory:

```
public/
  sounds/
    door-open.mp3
    door-close.mp3
    drawer-open.mp3
    drawer-close.mp3
```

Then load them in your app initialization (e.g., in `app/layout.tsx` or a sound initialization hook):

```typescript
import { soundManager } from '@/lib/animations';
import { useEffect } from 'react';

export const SoundInitializer = () => {
  useEffect(() => {
    soundManager.loadSound('doorOpen', '/sounds/door-open.mp3');
    soundManager.loadSound('doorClose', '/sounds/door-close.mp3');
    soundManager.loadSound('drawerOpen', '/sounds/drawer-open.mp3');
    soundManager.loadSound('drawerClose', '/sounds/drawer-close.mp3');
  }, []);

  return null;
};
```

If sound files are not loaded, animations will work silently (graceful degradation).