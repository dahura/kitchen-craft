# AI Integration - Quick Reference Guide

## What Was Added

### 1. New Tool: `saveKitchenConfig`
Saves generated kitchen configurations for rendering.

```typescript
// Called by AI agent after generating layout
saveKitchenConfig({
  config: KitchenConfig,        // Full configuration object
  modules: RenderableModule[],  // Generated 3D modules
  description: string,          // Optional description
})
// Returns: { success, configId, timestamp }
```

### 2. New API Route
**`/api/kitchen-config`** - Store and retrieve configurations

```typescript
// POST - Save configuration
POST /api/kitchen-config
Body: { config, modules, description }
Returns: { success, configId }

// GET - Retrieve configuration
GET /api/kitchen-config?id=kitchen-1234567890-abc123
Returns: { config, modules, timestamp }
```

### 3. Enhanced useAIChat Hook
Automatically loads AI-generated configurations into the store.

```typescript
// Hook now:
// 1. Extracts configId from AI response
// 2. Fetches config from API
// 3. Calls kitchenStore.loadConfig(config)
// 4. Triggers 3D scene re-render
```

## File Changes

### Modified Files
- `core/agent/tools.ts` - Added `saveKitchenConfig` tool
- `app/api/agent/route.ts` - Updated system prompt
- `app/(app)/(designer)/hooks/useAIChat.ts` - Added config loading logic

### New Files
- `app/api/kitchen-config/route.ts` - Configuration storage API
- `core/agent/__tests__/integration-flow.test.ts` - Integration tests
- `app/api/kitchen-config/__tests__/route.test.ts` - API tests

## How To Use

### For Testing
```bash
# Run integration tests
bun test core/agent/__tests__/integration-flow.test.ts

# Run API tests
bun test app/api/kitchen-config/__tests__/route.test.ts
```

### For Development
No special configuration needed. The system works automatically:

1. User sends message to AI chat
2. AI calls tools and generates kitchen
3. AI calls `saveKitchenConfig` and gets configId
4. Frontend extracts configId from response
5. Kitchen appears in 3D scene

### For Debugging
```typescript
// Check in browser console:
localStorage.setItem('debug', 'kitchen-craft:*')

// Check Zustand store:
useKitchenStore.getState()

// Check network requests:
// Look for POST /api/kitchen-config (save)
// Look for GET /api/kitchen-config?id=... (retrieve)
```

## Configuration Storage

### Current Implementation
- **Storage**: In-memory Map (resets on server restart)
- **Suitable for**: Development, testing
- **Limitation**: Configurations lost on redeploy

### Production Implementation (TODO)
- **Storage**: Database (PostgreSQL, MongoDB)
- **Benefits**: Persistent, shareable, versioned
- **Implementation**: Replace in-memory Map in `/api/kitchen-config/route.ts`

## System Prompt

The AI agent now knows about:
- `getMaterialLibrary()` - Get materials
- `getModuleLibrary()` - Get cabinet types
- `getRoomTextures()` - Get room options
- `validateKitchenConfig()` - Validate design
- `generateLayout()` - Create 3D layout
- **`saveKitchenConfig()`** - Save design ← NEW

**Important**: The prompt explicitly instructs the AI to always call `saveKitchenConfig` after generating a layout.

## Expected Workflow

```
User Input
    ↓
AI Gets Libraries (materials, modules, textures)
    ↓
AI Creates KitchenConfig
    ↓
AI Validates Config
    ↓
AI Generates Layout (RenderableModule[])
    ↓
AI Saves Config + Modules → Gets configId
    ↓
AI Returns Response with configId
    ↓
Frontend Extracts configId
    ↓
Frontend Fetches Full Config
    ↓
Frontend Updates Zustand Store
    ↓
3D Scene Re-renders ✨
```

## Common Issues & Solutions

### Issue: Kitchen not appearing
**Solution**: 
1. Check OpenAI API key is set
2. Check browser console for errors
3. Verify configId was extracted (search for "Found configuration ID")
4. Check network tab for `/api/kitchen-config` request

### Issue: "Tool called saveKitchenConfig" but nothing happens
**Solution**: 
1. Verify fetch to `/api/kitchen-config` succeeds
2. Check response has `configId` field
3. Verify response message includes the configId

### Issue: Tests failing
**Solution**: 
1. Ensure correct KitchenConfig structure (check types.ts)
2. Run: `bun test core/agent/__tests__/integration-flow.test.ts`
3. Check validator-engine for required fields

## Next Steps

1. **Test with real API key**: Set `OPENAI_API_KEY` and chat with AI
2. **Database integration**: Replace in-memory storage with DB
3. **User accounts**: Track configurations per user
4. **Configuration UI**: Add UI to load/save/manage designs

## API Reference

### saveKitchenConfig Tool
```typescript
{
  description: "Save a kitchen configuration and generated layout for rendering...",
  inputSchema: {
    config: KitchenConfig,        // Required
    modules: RenderableModule[],  // Required
    description: string,          // Optional
  },
  returns: {
    success: boolean,
    configId: string,            // "kitchen-TIMESTAMP-RANDOM"
    description: string,
    timestamp: string,           // ISO 8601
    message: string,             // Human-readable
  }
}
```

### POST /api/kitchen-config
```typescript
Request: {
  config: KitchenConfig,
  modules: RenderableModule[],
  description?: string,
}

Response: {
  success: boolean,
  configId: string,
  description: string,
  timestamp: string,
}

Error Response: {
  error: string,
  details?: string,
}
```

### GET /api/kitchen-config
```typescript
Query: id=kitchen-TIMESTAMP-RANDOM

Response: {
  config: KitchenConfig,
  modules: RenderableModule[],
  timestamp: string,
}

Error Response: {
  error: string,
  details?: string,
}
```

## Key Components

### Zustand Store (`kitchen-store.ts`)
```typescript
// Updated by: useAIChat hook
// When: Configuration is fetched from API
// Triggers: loadConfig(config)
// Result: Validates, generates layout, updates UI

const kitchenStore = useKitchenStore()
kitchenStore.loadConfig(fetchedConfig)
```

### Layout Engine (`layout-engine.ts`)
```typescript
// Input: Validated KitchenConfig
// Output: RenderableModule[] with 3D positions
// Called: By generateLayout tool
// Used: To render 3D cabinets
```

### Validation Engine (`validator-engine.ts`)
```typescript
// Input: Raw KitchenConfig
// Output: { isValid, errors, warnings, fixedConfig }
// Called: By validateKitchenConfig tool
// Ensures: Config meets all constraints
```

## Related Documentation

- [AI_INTEGRATION_COMPLETE_SOLUTION.md](./AI_INTEGRATION_COMPLETE_SOLUTION.md) - Full technical details
- [AI_INTEGRATION_FINAL_TESTING.md](./AI_INTEGRATION_FINAL_TESTING.md) - Testing procedures
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Overall system architecture
- [core/types.ts](../core/types.ts) - Type definitions

---

**Last Updated**: 2025-11-28  
**Status**: ✅ Ready for production with DB integration

