# Scripting Issue 02: iOS Gesture Timing Fix

**Date:** 2026-02-16
**Branch:** `dev_01_scripting_table_remedy_01`
**Predecessor:** [01-svg-court-measurement-and-ios-gesture-timing.md](./01-svg-court-measurement-and-ios-gesture-timing.md)

---

## Problem

After the SVG court measurement fix (01), Android tablet recorded actions correctly but **iOS phone did not record any actions** in portrait mode. The swipe pad never appeared, "Last scripted point" never updated, and action count stayed at 0.

## Root Cause

The four gestures are combined via `Gesture.Simultaneous()`:

```
gestureTapBegin   → Tap.onBegin   → sets padVisibleRef = true
gestureTapEnd     → Tap.onEnd     → sets padVisibleRef = false
gestureSwipeOnChange → Pan.onChange
gestureSwipeOnEnd → Pan.onEnd     → checks padVisibleRef → records action
```

The event firing order differs by platform:

| Step | Android | iOS |
|---|---|---|
| 1 | `Tap.onBegin` (padVisibleRef = true) | `Tap.onBegin` (padVisibleRef = true) |
| 2 | `Pan.onEnd` (reads true, records action) | `Tap.onEnd` (padVisibleRef = false) |
| 3 | `Tap.onEnd` (padVisibleRef = false) | `Pan.onEnd` (reads false, **skips action**) |

On iOS, `Tap.onEnd` fires before `Pan.onEnd`, so `padVisibleRef` is already `false` when `handleSwipeOnEnd` runs. Every action was blocked by the guard.

## Fix

Introduced `gatePassedRef` -- a separate ref decoupled from tap-end timing:

- **Set to `true`** in `handleTapBeginDetected` when the gate check passes (both portrait and landscape paths)
- **Checked** in `handleSwipeOnEnd` instead of `padVisibleRef`
- **Cleared to `false`** only by `handleSwipeOnEnd` itself, never by `handleTapEndDetected`

`padVisibleRef` continues to control the visual swipe pad display and is still cleared by `Tap.onEnd`. The two concerns (visual display vs action recording guard) are now independent.

### File modified

| File | Change |
|---|---|
| `src/app/scripting/ScriptingLive.tsx` | Added `gatePassedRef`, set it on gate pass, check+clear it in `handleSwipeOnEnd` |

## Result

Actions now record correctly on both iOS phone and Android tablet in portrait mode. All 6 court areas assign the correct area number.
