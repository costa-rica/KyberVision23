# Google Authentication Setup

This document explains how to configure Google Sign-In for the KyberVision mobile app on Android and iOS.

## Overview

Google Sign-In requires three separate OAuth 2.0 clients registered in Google Cloud Console — one per platform. Each serves a different purpose:

| Client Type | Used By                              | Passed to SDK?                                 |
| ----------- | ------------------------------------ | ---------------------------------------------- |
| Web         | Android (to get `idToken`)           | Yes — `webClientId` in `configure()`           |
| iOS         | iOS native sign-in flow              | Yes — `iosClientId` in `configure()`           |
| Android     | Google backend identity verification | No — registered only, never referenced in code |

All three clients live in the same Google Cloud project (`kybervision23`).

---

## Prerequisites

- Access to [Google Cloud Console](https://console.cloud.google.com) for project `kybervision23`
- Access to [Expo EAS](https://expo.dev) for the `kyber-vision-mobile-23` project
- The app's Android SHA-1 fingerprint (see below)

---

## Step 1 — Get the Android SHA-1 Fingerprint(s)

You may need **two different SHA-1s** depending on your distribution method:

### For preview builds (APK, direct install)

The EAS keystore SHA-1 is used because the APK is signed directly with it.

```bash
cd mobile
eas credentials
```

- Select build profile: **preview**
- Select platform: **Android**
- The SHA-1 is displayed in the **Keystore** section under `SHA1 Fingerprint`

### For production builds (AAB, via Play Store)

When distributed through Google Play with Play App Signing, Google **re-signs** the app with their own key. The SHA-1 on the user's device is different from the EAS keystore.

1. Go to **Google Play Console** → your app
2. Navigate to **Test and release → App integrity → App signing**
3. Under **"App signing key certificate"**, copy the **SHA-1 certificate fingerprint**

Copy the relevant SHA-1(s) — you will need them in Step 3. If you need Google Sign-In for both preview and production, you will create two Android OAuth clients (one per SHA-1).

---

## Step 2 — Create the Web OAuth Client

The web client is what Android uses to receive an `idToken` after sign-in.

1. Go to **Google Cloud Console → APIs & Services → Credentials**
2. Click **Create Credentials → OAuth client ID**
3. Application type: **Web application**
4. Name: something like `KyberVision Web Client`
5. Click **Create**
6. Copy the **Client ID** (format: `XXXXXXXXX-xxxx.apps.googleusercontent.com`)
7. Set this value as `EXPO_PUBLIC_GOOGLE_SIGNIN_WEB_CLIENT_ID` in `mobile/.env`

---

## Step 3 — Create the Android OAuth Client

This registers the app's identity with Google. It is not referenced in code — Google checks it silently using the app's package name and SHA-1.

1. Go to **Google Cloud Console → APIs & Services → Credentials**
2. Click **Create Credentials → OAuth client ID**
3. Application type: **Android**
4. Package name: `com.costarica.kybervisionmobile23`
5. SHA-1 certificate fingerprint: paste the value from Step 1
6. Click **Create**

No `.env` changes needed. No file to download. The client ID that appears is for Google's internal use only.

---

## Step 4 — Create the iOS OAuth Client

1. Go to **Google Cloud Console → APIs & Services → Credentials**
2. Click **Create Credentials → OAuth client ID**
3. Application type: **iOS**
4. Bundle ID: `com.costarica.kybervisionmobile23`
5. Click **Create**
6. Copy the **Client ID** (format: `XXXXXXXXX-xxxx.apps.googleusercontent.com`)
7. Set this value as `EXPO_PUBLIC_GOOGLE_SIGNIN_IOS_CLIENT_ID` in `mobile/.env`
8. Optionally download the `.plist` file and save it to `mobile/docs/google-credentials/` for reference

---

## Step 5 — Update `app.json`

The `iosUrlScheme` in `app.json` must be the **reversed** iOS client ID. Take the iOS client ID from Step 4 and reverse it:

```
Client ID:     572642369359-xxxx.apps.googleusercontent.com
Reversed form: com.googleusercontent.apps.572642369359-xxxx
```

Update this value in `app.json`:

```json
"plugins": [
  ["@react-native-google-signin/google-signin", {
    "iosUrlScheme": "com.googleusercontent.apps.572642369359-xxxx"
  }]
]
```

---

## Step 6 — Update `.env`

After Steps 2 and 4, `mobile/.env` should have:

```
EXPO_PUBLIC_GOOGLE_SIGNIN_IOS_CLIENT_ID=<iOS client ID from Step 4>
EXPO_PUBLIC_GOOGLE_SIGNIN_WEB_CLIENT_ID=<Web client ID from Step 2>
```

The Android client ID is **not** stored anywhere in the project.

---

## Step 7 — Rebuild

Since `app.json` changes are baked into the native build, a new EAS build is required:

```bash
cd mobile
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

---

## Current Credential IDs (as of Feb 2026)

| Type    | Client ID                                                                  |
| ------- | -------------------------------------------------------------------------- |
| Web     | `572642369359-a521vfajfri9c7u92fhoc2k6fo7vq4hp.apps.googleusercontent.com` |
| iOS     | `572642369359-5clos44hddg7afhkrgconc0anm878svd.apps.googleusercontent.com` |
| Android | `572642369359-k7f9pe5gnc0flk20l1ko3bta0fh8cl41.apps.googleusercontent.com` |

---

## Common Errors

### Error code 10 (`DEVELOPER_ERROR`) on Android

The app's SHA-1 fingerprint or package name is not registered in Google Cloud Console. The most common cause is using the wrong SHA-1.

**There are two different SHA-1 fingerprints depending on how the build is distributed:**

| Distribution                         | SHA-1 Source                | Where to Find It                                                                                             |
| ------------------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Preview** (APK, direct install)    | EAS keystore                | `eas credentials` → Android → Keystore → SHA1 Fingerprint                                                    |
| **Production** (AAB, via Play Store) | Google Play app signing key | Google Play Console → Test and release → App integrity → App signing → "App signing key certificate" → SHA-1 |

When you upload an AAB to Google Play, Google **re-signs** it with their own certificate (Play App Signing). The SHA-1 on the user's device is the Play Store key, not the EAS upload key. This means the Android OAuth client in Google Cloud Console must use the **Play Store SHA-1** for production builds.

If you need Google Sign-In to work in both preview and production, create **two Android OAuth clients** in Google Cloud Console — one with each SHA-1. Both use the same package name (`com.costarica.kybervisionmobile23`).

**Checklist:**

- Verify the Android OAuth client(s) exist with the correct package name and the correct SHA-1 for your distribution method
- Verify `EXPO_PUBLIC_GOOGLE_SIGNIN_WEB_CLIENT_ID` matches the **Web** OAuth client ID (not Android or iOS)
- No rebuild is needed after updating OAuth clients in Google Cloud Console — the fix takes effect at runtime
- Changes may take a few minutes to propagate on Google's side

### Error `EXPO_GO_UNSUPPORTED`

Google Sign-In is not available in Expo Go. Use a preview or development build via EAS.

### OAuth access restricted to test users

If the OAuth consent screen is in "Testing" status, only accounts listed as test users can sign in. Add accounts at **Google Cloud Console → Google Auth Platform → Audience → Test users**.

---

## Notes

- `google-services.json` (Firebase) is **not required** for Google Sign-In. Do not confuse the Firebase config file with the OAuth client secret JSON downloaded from the Credentials page.
- The JSON file downloaded from the Credentials page after creating an Android client is a desktop/installed app secret — it is not used in this project.
- EAS manages the Android keystore. If you ever rotate the keystore, a new SHA-1 must be registered and a new Android OAuth client created.
