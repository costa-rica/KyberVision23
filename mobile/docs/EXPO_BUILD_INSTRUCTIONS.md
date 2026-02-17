# Expo Build Instructions — KyberVision Mobile 23

This app uses **native modules** (`@react-native-google-signin/google-signin`, Reanimated, etc.) and cannot run in Expo Go. A **development build** must be installed on each device. Once installed, the app connects to your local Metro bundler for fast JS hot-reload — the experience is identical to Expo Go.

## Build Profile Summary

- This document is geared to explaining how to do a `development` build in this table.

| Profile         | Command                             | Output                               | Use case               |
| --------------- | ----------------------------------- | ------------------------------------ | ---------------------- |
| `development`   | `eas build --profile development`   | iOS: .ipa (internal) / Android: .apk | Dev builds for testing |
| `preview`       | `eas build --profile preview`       | iOS: store .ipa / Android: .aab      | Pre-release testing    |
| `production`    | `eas build --profile production`    | Store-ready bundles                  | App Store / Play Store |
| `ios-simulator` | `eas build --profile ios-simulator` | iOS Simulator .app                   | Simulator-only testing |

---

## Prerequisites (all platforms)

```bash
# Install EAS CLI globally (if not already)
npm install -g eas-cli

# Log in to your Expo account
eas login

# Verify you are logged in
eas whoami
```

Ensure you are running commands from the `mobile/` directory:

```bash
cd mobile
```

---

## Day-to-Day Development Workflow

Once the development build is installed on a device, your normal workflow is:

```bash
cd mobile
npm start          # runs tsc --noEmit first (prestart hook), then expo start
```

The installed dev client app on your device will connect to the Metro bundler. You get full JS hot-reload without rebuilding native code.

**Only rebuild native code when you:**

- Add or remove a package that has a native module
- Change `plugins`, `ios`, or `android` sections in `app.json`
- Run `npx expo prebuild` manually

---

## Development Builds

| Profile         | Command                             | Output                               | Use case               |
| --------------- | ----------------------------------- | ------------------------------------ | ---------------------- | ----------- |
| `development`   | `eas build --profile development`   | iOS: .ipa (internal) / Android: .apk | Dev builds for testing | <----- Here |
| `preview`       | `eas build --profile preview`       | iOS: store .ipa / Android: .aab      | Pre-release testing    |
| `production`    | `eas build --profile production`    | Store-ready bundles                  | App Store / Play Store |
| `ios-simulator` | `eas build --profile ios-simulator` | iOS Simulator .app                   | Simulator-only testing |

### iOS Development Build

#### Prerequisites

- Xcode installed (App Store)
- Xcode Command Line Tools: `xcode-select --install`
- Apple Developer account (paid, $99/yr) — already required for physical device builds
- Apple ID added to Xcode: **Xcode > Settings > Accounts**

---

#### Option A — Local Build (Recommended for Development)

Builds natively on your Mac via Xcode. No cloud, no waiting for a remote build queue.
The `ios/` directory will be generated the first time you run this.

**First time / after any native dependency change:**

```bash
npx expo run:ios --device
```

- Expo will prompt you to select your connected iPhone from a list.
- Connect your iPhone via USB and trust the computer on the device when prompted.
- Xcode handles code signing automatically using your Apple Developer account.
- The first build takes several minutes. Subsequent launches are near-instant.

**Subsequent dev sessions (no native changes):**

```bash
npx expo start
```

Open the app on your phone — it will connect to the Metro bundler automatically.

**If you change a native dependency** (add/remove a package with native code, or modify `app.json` plugins), you must rebuild:

```bash
npx expo run:ios --device
```

---

#### Option B — EAS Cloud Build

Builds on Expo's servers. Useful for sharing builds with others or when you want a distributable `.ipa` without running Xcode locally.

**Trigger a development build:**

```bash
eas build --profile development --platform ios
```

- EAS will walk you through Apple provisioning on the first run.
- When the build finishes, EAS provides an install link and QR code.
- Open the link on your iPhone to install the `.ipa` (distributed as internal distribution).

**After installing the EAS-built app, start the dev server:**

```bash
npx expo start --dev-client
```

Scan the QR code in the terminal with your iPhone camera, or enter the URL manually in the dev client app.

---

#### iOS Troubleshooting

| Problem                          | Solution                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| "Untrusted Developer" on device  | Settings > General > VPN & Device Management > trust your certificate                |
| Build fails on code signing      | Open `mobile/ios/*.xcworkspace` in Xcode, set your Team under Signing & Capabilities |
| Metro not reachable on device    | Ensure phone and Mac are on the same Wi-Fi network                                   |
| `expo run:ios` can't find device | Unlock your phone; check `xcrun xctrace list devices`                                |

---

### Android Development Build

#### Prerequisites

- Android Studio installed
- Android SDK and platform tools: install via Android Studio > SDK Manager
- `adb` available on PATH (comes with Android Studio platform tools)
- On your Android tablet: **Settings > About > tap Build Number 7 times** to enable Developer Options, then enable **USB Debugging**

---

#### Option A — Local Build (Recommended for Development)

```bash
npx expo run:android --device
```

- Connect your Android tablet via USB and accept the debugging prompt on the device.
- Expo will detect the device automatically via `adb`.
- The first build takes several minutes. Subsequent launches are near-instant.

**Subsequent dev sessions:**

```bash
npx expo start
```

**If you change a native dependency**, rebuild:

```bash
npx expo run:android --device
```

---

#### Option B — EAS Cloud Build

The development profile in `eas.json` is already configured to produce an **APK** for Android (easier to sideload than an AAB).

```bash
eas build --profile development --platform android
```

- When the build finishes, EAS provides a download link for the `.apk`.
- Transfer the APK to your tablet (via link, email, or USB) and install it.
- You may need to allow installs from unknown sources: **Settings > Security > Install unknown apps**.

**After installing, start the dev server:**

```bash
npx expo start --dev-client
```

Scan the QR code or enter the URL in the dev client app on the tablet.

---

#### Android Troubleshooting

| Problem             | Solution                                                                             |
| ------------------- | ------------------------------------------------------------------------------------ |
| Device not found    | Run `adb devices` — should list your tablet. Re-plug USB if empty                    |
| Unauthorized device | Accept the RSA fingerprint prompt on the tablet                                      |
| Metro not reachable | Phone and Mac must share the same Wi-Fi. Try `npx expo start --tunnel` as a fallback |
| APK install blocked | Enable "Install unknown apps" for your browser/file manager in device settings       |

---

## Preview Builds

| Profile         | Command                             | Output                               | Use case               |
| --------------- | ----------------------------------- | ------------------------------------ | ---------------------- | ----------- |
| `development`   | `eas build --profile development`   | iOS: .ipa (internal) / Android: .apk | Dev builds for testing |
| `preview`       | `eas build --profile preview`       | iOS: store .ipa / Android: .aab      | Pre-release testing    | <----- Here |
| `production`    | `eas build --profile production`    | Store-ready bundles                  | App Store / Play Store |
| `ios-simulator` | `eas build --profile ios-simulator` | iOS Simulator .app                   | Simulator-only testing |
