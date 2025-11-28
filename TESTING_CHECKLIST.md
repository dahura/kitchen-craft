# AI Kitchen Design - Testing Checklist ✅

## Pre-Flight Checks

- ✅ OpenAI API key is set in environment
- ✅ Dev server running (`bun dev`)
- ✅ No TypeScript errors
- ✅ All tests passing

## Testing Steps

### Step 1: Browser Navigation
- [ ] Open http://localhost:3000
- [ ] Navigate to main page
- [ ] Verify no 404 errors

### Step 2: AI Chat Interface
- [ ] Find AI chat panel (right sidebar or bottom)
- [ ] Verify chat input field visible
- [ ] Check send button works

### Step 3: Simple Request
- [ ] Type: "Create a simple kitchen"
- [ ] Click Send
- [ ] **WAIT FOR RESPONSE** (takes 10-30 seconds on first call)

### Step 4: Check AI Workflow
Look in **browser console** for:
- [ ] `"Tool called: getMaterialLibrary"`
- [ ] `"Tool called: getModuleLibrary"`
- [ ] `"Tool called: getRoomTextures"`
- [ ] `"Tool called: validateKitchenConfig"`
- [ ] `"Tool called: generateLayout"`
- [ ] `"Tool called: saveKitchenConfig"` ← THIS IS CRITICAL

Look in **server logs** (`bun dev` terminal) for:
- [ ] `Tool called: getMaterialLibrary { category: 'all' }`
- [ ] `Tool called: getModuleLibrary { moduleType: 'all' }`
- [ ] `Tool called: getRoomTextures { surfaceType: 'all' }`
- [ ] `Tool called: validateKitchenConfig { config: {...} }`
- [ ] `Tool called: generateLayout { config: {...} }`
- [ ] `Tool called: saveKitchenConfig { config: {...}, modules: [...] }`
- [ ] `Saved kitchen configuration: kitchen-XXXXXXXXXX-xxxxxx`

### Step 5: Verify Configuration Saved
- [ ] Look for message in chat: "kitchen-XXXXXXXXXX-xxxxxx"
- [ ] Should be in AI response

### Step 6: Check Configuration Fetch
Look in **browser Network tab**:
- [ ] POST `/api/kitchen-config` - Status 200 ✓
- [ ] GET `/api/kitchen-config?id=kitchen-XXXX` - Status 200 ✓

### Step 7: Verify Kitchen Renders
- [ ] 3D scene shows kitchen ✓
- [ ] Cabinets visible ✓
- [ ] Materials applied ✓
- [ ] Countertop visible ✓

### Step 8: Advanced Request
- [ ] Try: "Create a modern white kitchen with 3 base cabinets and a countertop"
- [ ] Verify response contains specific configuration
- [ ] Check that 3D scene updates

### Step 9: Verify Config Structure
In **browser console**, run:
```javascript
useKitchenStore.getState().currentConfig
```
Check that it has:
- [ ] `kitchenId`: string ✓
- [ ] `name`: string ✓
- [ ] `globalSettings`: object ✓
- [ ] `layoutLines`: array with modules ✓
- [ ] `hangingModules`: array ✓

### Step 10: Verify Rendered Modules
In **browser console**, run:
```javascript
useKitchenStore.getState().renderableModules
```
Check that:
- [ ] Array has at least 1 item ✓
- [ ] Each item has: id, type, position, dimensions ✓
- [ ] Position has x, y, z coordinates ✓

## Expected Success Indicators

### ✅ Correct Behavior
1. AI responds with text description
2. Response includes configId (e.g., "kitchen-1234567890-abc123")
3. Configuration fetched from API
4. Kitchen appears in 3D scene
5. All cabinets visible with materials
6. No errors in console

### ❌ If Not Working

**Problem**: No AI response
- [ ] Check OpenAI API key is set: `echo $OPENAI_API_KEY`
- [ ] Check server logs for `[AI_LoadAPIKeyError]`

**Problem**: Configuration not saving
- [ ] Check POST `/api/kitchen-config` returns 200
- [ ] Check server logs for save message
- [ ] Verify API route is deployed

**Problem**: Kitchen not rendering
- [ ] Check GET `/api/kitchen-config?id=...` returns 200
- [ ] Check browser console for errors
- [ ] Verify renderableModules array is populated
- [ ] Check Three.js errors in console

**Problem**: Configuration validation fails
- [ ] Check server logs for validation errors
- [ ] Verify AI created correct structure (check System Prompt)
- [ ] Look for Zod validation messages

## Performance Checks

- [ ] First response: < 30 seconds (includes API calls)
- [ ] Subsequent responses: < 15 seconds
- [ ] 3D rendering: Smooth, no stuttering
- [ ] No memory leaks (check heap size stays constant)

## Data Integrity Checks

- [ ] Configuration saved matches what was created
- [ ] Rendered modules count matches expected
- [ ] Materials are correctly applied
- [ ] Positions are reasonable (not overlapping)

## Browser Compatibility

- [ ] Chrome/Chromium: ✅
- [ ] Firefox: ✅
- [ ] Safari: ✅
- [ ] Edge: ✅

## Error Scenarios (Expected to Handle)

- [ ] Invalid API key → Clear error message ✓
- [ ] Network error → Retry available ✓
- [ ] Malformed config → Validation error shown ✓
- [ ] Missing modules → Graceful failure ✓

## Cleanup After Testing

- [ ] Clear browser cache if needed
- [ ] Stop dev server (`Ctrl+C`)
- [ ] Review logs for any warnings
- [ ] Note any issues for next session

## Sign-Off

| Check | Status | Notes |
|-------|--------|-------|
| Pre-flight | ✅ | Everything ready |
| AI Response | ⏳ | Pending test |
| Config Save | ⏳ | Pending test |
| 3D Render | ⏳ | Pending test |
| Full Workflow | ⏳ | Pending test |

## Quick Test Command

```bash
# After starting dev server, run this in another terminal:
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "Create a simple kitchen" }
    ]
  }'
```

This will stream the response and show all tool calls.

## Next Steps After Successful Test

1. ✅ Verify all features work
2. ✅ Check performance
3. ✅ Note any edge cases
4. ✅ Document findings
5. ✅ Deploy to staging
6. ✅ Perform load testing
7. ✅ Deploy to production

---

**Date**: 2025-11-28  
**Status**: Ready for testing  
**Expected Duration**: 15-20 minutes  
**Outcome**: Kitchen renders in 3D from AI request

