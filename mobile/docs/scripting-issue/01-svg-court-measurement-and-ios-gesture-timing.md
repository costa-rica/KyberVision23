# Scripting Issue 01: SVG Court Measurement & iOS Gesture Timing

**Date:** 2026-02-16
**Branch:** `dev_01_scripting_table_remedy_01`

---

## Problem Identified

Grid lines (dashed court dividers) and gesture area calculations (front row vs back row) were positioned based on full container dimensions. The SVG volleyball court (fixed 293x185 intrinsic size) doesn't fill the container -- especially on tablets -- causing the horizontal midline to appear below the court's visual center.

## Fix Applied: SVG Court Measurement

Wrapped `<SvgVolleyballCourt />` in a measured `<View onLayout={...}>` in both Portrait and Landscape components. Stored the SVG court's actual position (`x`, `y`, `width`, `height`) in the Redux reducer via two new fields:

- `coordsScriptLivePortraitSvgCourt`
- `coordsScriptLiveLandscapeSvgCourt`

Updated grid line styles and gesture area Y-split thresholds to use the SVG court's measured center instead of the container's center.

### Files modified

| File | Change |
|---|---|
| `src/reducers/script.ts` | Added 2 new `Coordinates` fields + reducer actions |
| `src/components/scripting/ScriptingLivePortrait.tsx` | Measure SVG, fix grid lines, remove old spacer-based calc |
| `src/components/scripting/ScriptingLiveLandscape.tsx` | Measure SVG, fix grid lines |
| `src/app/scripting/ScriptingLive.tsx` | Use SVG coords for Y-split in both orientations |

### Result: Aesthetics

**Grid lines now visually bisect the SVG court correctly** on both Android tablet and iOS phone in portrait and landscape. The horizontal dashed line sits at the court's visual midpoint rather than being offset by spacer height or container padding. This is confirmed working.

---

## Outstanding Issue: iOS Actions Not Recording

After the aesthetic fix, **Android tablet records actions correctly in portrait mode**. However, **iOS phone (portrait) does not record any actions**. Symptoms:

- "Last scripted point" row above the court never updates
- Action count ("N actions recorded") at bottom-left stays at 0
- The swipe pad (radial wheel) never appears on screen

### Root Cause Analysis

Comparing the terminal logs between platforms reveals the issue clearly.

**iOS log pattern (every tap):**
```
LOG  gestureTapBegin
LOG  [DEBUG TAP] gate check: y(113) > spacerHeight(48) = true   <-- gate passes
LOG  gestureTapEnd                                                <-- tap END fires immediately
LOG  [DEBUG SWIPE_END] skipped - pad was not visible (gate-blocked tap)
```

**Android log pattern (every tap):**
```
LOG  gestureTapBegin
LOG  [DEBUG TAP] gate check: y(64.6) > spacerHeight(64.6) = true  <-- gate passes
LOG  tapDetails: ...                                                 <-- swipe END fires while pad visible
LOG  [DEBUG SWIPE_END] area=4, type=Def, quality=+                   <-- action recorded!
LOG  gestureTapEnd                                                   <-- tap END fires AFTER swipe
```

### The timing difference

The four gestures are combined via `Gesture.Simultaneous()`:

```ts
const combinedGestures = Gesture.Simultaneous(
  gestureTapBegin,    // Tap.onBegin  --> sets padVisibleRef = true
  gestureTapEnd,      // Tap.onEnd    --> sets padVisibleRef = false
  gestureSwipeOnChange,
  gestureSwipeOnEnd   // Pan.onEnd    --> checks padVisibleRef, records action
);
```

**On Android**, the event order is:
1. `Tap.onBegin` -- sets `padVisibleRef.current = true`
2. `Pan.onEnd` (swipe end) -- reads `padVisibleRef.current === true` --> records action
3. `Tap.onEnd` -- sets `padVisibleRef.current = false`

**On iOS**, the event order is:
1. `Tap.onBegin` -- sets `padVisibleRef.current = true`
2. `Tap.onEnd` -- sets `padVisibleRef.current = false` (fires **before** Pan.onEnd)
3. `Pan.onEnd` (swipe end) -- reads `padVisibleRef.current === false` --> **skips action**

The `padVisibleRef` guard was added in Fix 1 to prevent ghost actions from gate-blocked taps. On iOS, `Tap.onEnd` fires before `Pan.onEnd` within the simultaneous gesture group, so the guard incorrectly blocks every action.

### Key evidence from logs

| Platform | containerMiddle | spacer height | Screen width | Tap events produce action? |
|---|---|---|---|---|
| iOS phone | `{x:0, y:181, w:320, h:257}` | 48 | 320 | No -- every swipe_end skipped |
| Android tablet | `{x:0, y:206.6, w:600.9, h:274.2}` | 64.6 | ~601 | Yes -- all 6 areas recorded |

All 6 iOS taps pass the gate check but every single one hits `[DEBUG SWIPE_END] skipped - pad was not visible (gate-blocked tap)`.

### Next steps

The fix needs to handle the iOS gesture event ordering. Possible approaches:

1. **Remove the `padVisibleRef` guard** from `handleSwipeOnEnd` and find an alternative way to filter ghost actions from gate-blocked taps
2. **Delay the `padVisibleRef = false` reset** in `handleTapEndDetected` (e.g. `setTimeout`) to give `Pan.onEnd` time to fire first
3. **Use a different flag** set during the gate check that `Pan.onEnd` can read independently of the tap-end timing
4. **Restructure the gesture composition** so that `Tap.onEnd` doesn't race with `Pan.onEnd`

These will be addressed in the next iteration (02).
