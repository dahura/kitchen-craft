# Room Textures Library

This directory contains all textures used for room visualization (walls, floors, ceilings) in the Kitchen Craft application.

## Structure
```
rooms/
├── walls/          # Wall texture sets
├── floors/         # Floor texture sets  
└── ceilings/       # Ceiling texture sets
```

## Texture Sets
Each texture set should contain PBR (Physically Based Rendering) textures:
- `diffuse.jpg` - Base color/albedo
- `normal.jpg` - Surface normal details
- `roughness.jpg` - Surface roughness
- `displacement.jpg` - Height/displacement
- `ambientOcclusion.jpg` - AO map (optional)

## Usage
Textures are managed through the RoomTextureLibrary system in `core/libraries/room-texture-library/`.
They are independent from kitchen material system and are used specifically for room surfaces.