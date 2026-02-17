# Scripting Live Gesture Capture System

This document explains how the live scripting gesture system works across the relevant components and reducers.

## Purpose

The Scripting Live screen allows a user to record volleyball game actions in real time using touch gestures on a volleyball court image. A tap on the court shows a SwipePad (wheel) and the user's subsequent swipe direction encodes the action type and quality.

## Key Files

| File | Role |
|---|---|
| `src/app/scripting/ScriptingLive.tsx` | Main logic: gesture definitions, action recording, score tracking |
| `src/components/scripting/ScriptingLivePortrait.tsx` | Portrait layout: court, score UI, last-action dropdowns |
| `src/components/scripting/ScriptingLiveLandscape.tsx` | Landscape layout variant |
| `src/components/swipe-pads/SwipePad.tsx` | The radial wheel rendered at the tap point |
| `src/app/scripting/ScriptingLiveSelectPlayers.tsx` | Pre-screen that sets SwipePad radii and player lineup |
| `src/reducers/script.ts` | Redux state: actions array, coordinate measurements, player positions |
| `src/reducers/user.ts` | Redux state: SwipePad radii (`circleRadiusOuter/Middle/Inner`), wheel colors |

## Orientation Handling

`ScriptingLive.tsx` listens for orientation changes via `expo-screen-orientation`. It renders either `ScriptingLivePortrait` or `ScriptingLiveLandscape` based on the current orientation. The gesture handlers in `ScriptingLive.tsx` branch on `orientation` to use the correct coordinate offsets for each layout.

## Gesture Flow (4 Steps)

All gestures are combined into a single `Gesture.Simultaneous(tapBegin, tapEnd, panChange, panEnd)` and passed down to the portrait/landscape component as `combinedGestures`.

### Step 1: Tap Begin (`gestureTapBegin` / `handleTapBeginDetected`)

When the user taps inside the `GestureDetector` area:

1. **Early exits**: If server status is not set or the match is already won, the gesture is blocked.
2. **SwipePad position calculation** (portrait):
   - `padPosCenterX = event.x - circleRadiusOuter`
   - `padPosCenterY = event.y + containerMiddle.y - circleRadiusOuter`
   - The `event.x` / `event.y` are relative to the GestureDetector's child view (`containerMiddleSub`), not the screen.
   - `containerMiddle.y` is an offset measured via `onLayout` to translate into the parent coordinate system.
3. **Gate condition** (portrait): The SwipePad only appears if:
   ```
   event.y > coordsScriptLivePortraitVwPlayerSuperSpacer.height
   ```
   This prevents taps in the player name spacer area (at the top of the gesture view) from triggering an action. The spacer height equals `btnDiameter = Dimensions.get("window").width * 0.15`.

4. If the gate passes, `padVisible` is set to `true` and `tapIsActive` is set to `false` (preventing double-taps).

### Step 2: Swipe onChange (`gestureSwipeOnChange` / `handleSwipeOnChange`)

As the user drags their finger:

1. The current finger position is converted to the same coordinate system as the pad center.
2. `distanceFromCenter` is calculated (Euclidean distance from the pad center).
3. The position is classified into one of three rings:
   - **Inner circle** (`< circleRadiusInner`): Center / null zone — no action will be recorded.
   - **Middle circle** (`< circleRadiusMiddle`): Determines the **action type** (1 of 4 quadrants: right=Bl, bottom=Def, left=Set, top=Att). Stored in `lastActionTypeIndexRef`.
   - **Outer circle** (`>= circleRadiusMiddle`): Determines the **quality** (each quadrant is subdivided into 3 sectors = 12 total outer segments). Stored in `lastActionQualityIndexRef`.
4. The corresponding SwipePad segment is highlighted via `handleSwipeColorChange`.

The angle math in `logicFourTwelveCircle` uses tangent boundaries at 15, 45, and 75 degrees to divide the circle into quadrants and sub-sectors.

### Step 3: Swipe End (`gestureSwipeOnEnd` / `handleSwipeOnEnd`)

When the user lifts their finger:

1. If `distanceFromCenter > circleRadiusInner`, an action is recorded. Otherwise, the swipe is discarded ("no action registered on this swipe").
2. **Court area determination** (portrait): The original tap position is used to determine which of 6 court areas the action belongs to:
   - `tapYAdjusted = padPosCenterY + circleRadiusOuter` (reconstructs the original `event.y + containerMiddle.y`)
   - `tapXAdjusted = padPosCenterX + circleRadiusOuter` (reconstructs the original `event.x`)
   - **Y split**: `tapYAdjusted > containerMiddle.y + containerMiddle.height * 0.5` divides front row (areas 2, 3, 4) from back row (areas 1, 6, 5).
   - **X split**: Thresholds at `containerMiddle.width * 0.33` and `* 0.66` divide into three columns.
   - Mapping:
     ```
     Back row (bottom half of court):   5 (left) | 6 (center) | 1 (right)
     Front row (top half of court):     4 (left) | 3 (center) | 2 (right)
     ```
3. `addNewActionToScriptReducersActionsArray` builds a `SessionAction` object and appends it to the Redux actions array.

### Step 4: Tap End (`gestureTapEnd` / `handleTapEndDetected`)

When the tap gesture ends (up to 10 second `maxDuration`):

- `padVisible` is set to `false` (hides the SwipePad).
- `tapIsActive` is set to `true` (re-enables tapping).

## SessionAction Object

Each recorded action (`SessionAction` in `src/reducers/script.ts`) contains:

| Field | Source |
|---|---|
| `type` | Middle ring quadrant (Bl, Def, Set, Att, Serve, Reception) |
| `quality` | Outer ring sector (=, -, 0, +, #) |
| `area` | Court zone 1-6 from tap position |
| `playerId` | Either `scriptingForPlayerObject.id` (single-player mode) or from `playerObjectPositionalArray[area - 1]` (positional mode) |
| `setNumber` | Derived from `matchSetsWon.teamAnalyzed + matchSetsWon.teamOpponent + 1` |
| `scoreTeamAnalyzed` / `scoreTeamOther` | Current set scores at time of action |
| `currentRallyServer` | "analyzed" or "opponent" |
| `timestamp` | `Date.now()` |
| `subtype` | `null` initially; can be modified after recording via the last-action dropdown |

## SwipePad Radii

Set in `ScriptingLiveSelectPlayers.tsx` via `reducerSetUserSwipePadWheel`:

```
circleRadiusOuter: 60
circleRadiusMiddle: 40
circleRadiusInner: 20
```

These are fixed pixel values, not responsive to screen size.

## Portrait Layout Structure

```
ScreenFrameWithTopChildrenSmall
└── ScriptingLivePortrait
    ├── containerTop
    │   ├── Team names bar
    │   ├── Score + sets display
    │   └── Last scripted action buttons + dropdowns
    │
    ├── containerMiddle (onLayout → coordsScriptLivePortraitContainerMiddle)
    │   ├── Player display (absolute child → 0 layout height)
    │   ├── Player dropdown (conditional, takes layout space when visible)
    │   └── View style={{}}
    │       ├── Court dashed lines (absolute positioned, zIndex: 1)
    │       └── GestureDetector
    │           └── containerMiddleSub (bg: #F0EAF9, full width)
    │               ├── vwPlayerSuperSpacer (height: btnDiameter, onLayout → coords)
    │               └── SvgVolleyballCourt (no explicit dimensions)
    │
    └── containerBottom
        ├── Service/Reception + Win/Lose + Favorite buttons
        └── Send script button + grid toggle

SwipePad (rendered by ScriptingLive.tsx, positioned absolutely over everything)
```

## Coordinate Systems

There are two coordinate systems in play:

1. **GestureDetector-relative**: `event.x` and `event.y` from gesture events are relative to `containerMiddleSub` (the direct child of GestureDetector).
2. **Container-relative**: `coordsScriptLivePortraitContainerMiddle` (measured via `onLayout`) gives the position/size of `containerMiddle` relative to its parent (`ScriptingLivePortrait`'s root container).

The SwipePad is positioned in the parent coordinate system, so the gesture coordinates are translated by adding `containerMiddle.y` to the event's `y`.

## Court Area Grid (Portrait)

The 6 court areas map to volleyball positions. The court view is divided into a 3-column x 2-row grid:

```
┌─────────────┬─────────────┬─────────────┐
│             │             │             │
│   Area 4    │   Area 3    │   Area 2    │  ← Front row (top half, closer to net)
│   (left)    │  (center)   │   (right)   │
│             │             │             │
├─────────────┼─────────────┼─────────────┤
│             │             │             │
│   Area 5    │   Area 6    │   Area 1    │  ← Back row (bottom half)
│   (left)    │  (center)   │   (right)   │
│             │             │             │
└─────────────┴─────────────┴─────────────┘
    0–33%         33–66%        66–100%       ← X thresholds (containerMiddle.width)
```

Y threshold: `containerMiddle.y + containerMiddle.height * 0.5`

When `isVisibleCourtLines` is true, dashed lines are drawn at these boundaries.

---

## Known Issue: Android Tablet Gesture Dead Zone (Investigation)

### Observed behavior

On Android tablets (not yet tested on iPad), there is an area in the upper portion of the gesture capture zone in portrait mode that does not respond to user gestures.

### Potential causes

#### 1. Court midpoint calculation includes the spacer

The Y-split that divides front row from back row uses:

```js
tapYAdjusted > containerMiddle.y + containerMiddle.height * 0.5
```

Which simplifies to `event.y > containerMiddle.height * 0.5`.

But `containerMiddle.height` includes:
- `vwPlayerSuperSpacer` (height = `Dimensions.get("window").width * 0.15`)
- `SvgVolleyballCourt` intrinsic height
- 20px padding + 4px border

The visual court midpoint is at `spacerHeight + svgHeight / 2`, not `containerMiddle.height / 2`. On a phone (width ~390px), the spacer is ~58px and the error is small (~29px). On a tablet (width ~800px), the spacer is ~120px and the error is ~60px, causing significant misclassification of taps in the upper-middle court area.

This would cause wrong area assignment but not necessarily a complete dead zone.

#### 2. SvgVolleyballCourt has no explicit dimensions

`<SvgVolleyballCourt />` is rendered without width/height props. If the SVG renders at a fixed intrinsic size, the `containerMiddleSub` (and therefore the GestureDetector's touchable area) may not scale up to fill the expected court space on a tablet. Taps outside this fixed-size area would produce no gesture event at all.

#### 3. Player info button may intercept touches on Android

When `scriptingForPlayerObject` is set, an absolutely positioned `ButtonKvNoDefault` overlaps the top of the gesture area. On Android, absolutely positioned touchable components from a sibling view can intercept touches before they reach the GestureDetector.

#### 4. SwipePad radii are fixed pixel values

The radii (outer: 60, middle: 40, inner: 20) are not scaled for tablet screen sizes. While this doesn't cause a dead zone, it means the SwipePad is proportionally very small on tablets.

### Recommended next steps

Add debug logging in `handleTapBeginDetected` to capture:

```js
console.log(`[DEBUG TAP] event.y=${y}, spacerHeight=${scriptReducer.coordsScriptLivePortraitVwPlayerSuperSpacer.height}`);
console.log(`[DEBUG TAP] containerMiddle=${JSON.stringify(scriptReducer.coordsScriptLivePortraitContainerMiddle)}`);
console.log(`[DEBUG TAP] gate passed: ${y > scriptReducer.coordsScriptLivePortraitVwPlayerSuperSpacer.height!}`);
```

And in `handleSwipeOnEnd`:

```js
console.log(`[DEBUG SWIPE_END] tapYAdjusted=${tapYAdjusted}, threshold=${scriptReducer.coordsScriptLivePortraitContainerMiddle.y! + scriptReducer.coordsScriptLivePortraitContainerMiddle.height! * 0.5}`);
console.log(`[DEBUG SWIPE_END] area=${lastActionAreaIndexRef.current}`);
```

This will confirm whether taps are reaching the gesture handler at all (cause 2/3) or are being misrouted (cause 1).
