# Apple Warning

This is a warnign in the TestFlight page of appstore connect.

## The warning

90725: SDK version issue. This app was built with the iOS 18.5 SDK. Starting April 28, 2026, all iOS and iPadOS apps must be built with the iOS 26 SDK or later, included in Xcode 26 or later, in order to be uploaded to App Store Connect or submitted for distribution.

## Claude (Opus) analysis

Understanding the Warning

This is an informational warning, not a blocking error. Your build is still accepted for
TestFlight — Apple is just giving you advance notice of an upcoming requirement.

What it means

- Your app was built with iOS 18.5 SDK (which comes with your current Xcode version)
- Starting April 28, 2026 (~2 months from now), Apple will require the iOS 26 SDK
  (bundled with Xcode 26)
- After that date, builds using the older SDK won't be accepted

Why "iOS 26"?

Apple rebranded their OS versioning at WWDC 2025 — they jumped from iOS 18.x to iOS 26
(aligning version numbers across platforms). So iOS 26 is effectively "iOS 19".

Effort to Fix

Low effort, but timing-dependent. Here's what's needed:

1. Update Xcode to Xcode 26 (currently in beta, GA expected ~spring 2026)
2. Update your Expo SDK — you'll likely need to upgrade to whatever Expo SDK version
   supports the iOS 26 SDK. Expo typically releases updates shortly after Apple's new
   Xcode/SDK versions stabilize.
3. Rebuild & resubmit with the new toolchain

What to do now

- Nothing urgent — your TestFlight build works fine today
- Before April 28, 2026: Update Xcode to version 26 and rebuild
- Keep an eye on Expo's release notes for iOS 26 SDK support

The rebuild itself is straightforward (just using a newer Xcode), but Expo SDK upgrades
can sometimes involve dependency updates. For a typical project, expect a few hours to a
day of work, mostly testing that everything still works with the new SDK.
