# Thoth — Android TWA

Wrapper for https://thoth.elghaly.dev as a Trusted Web Activity.

- package id: `dev.elghaly.thoth`
- app name: Thoth, launcher name Thoth, language `hi`
- display: standalone, start_url `/use/` (matches `manifest.webmanifest`), theme and background `#0b0c10`
- icons: `/icon-512.png`, maskable `/icon-maskable-512.png`, web manifest `/manifest.webmanifest`
- compileSdk/targetSdk 35, minSdk 23 (`android/app/build.gradle`); printed by CI from the merged release manifest.
- `app/public/site.webmanifest` (served at `/use/site.webmanifest`): Hindi, standalone, 192 and 512 ("any maskable") icons, name with "by Elghaly LLC".

## Build

CI `android-twa`:

- `manifest-check` (tools/check-twa.mjs) on every PR.
- `build-unsigned-aab` on every PR: Gradle `bundleRelease` with no key, fails if the bundle is
  signed, prints the SDK levels, size and sha256, uploads the artifact.
- `signed-release-aab`, **manual only** (Actions → android-twa → Run workflow). It signs with
  the **upload key** from four repository secrets, verifies the signature, prints the upload
  certificate's SHA-256 (a public value), and deletes the keystore from the runner at the end.

`android/app/build.gradle` signs only when `THOTH_UPLOAD_STORE_FILE` is set by CI; every
signing value is an environment read, and `manifest-check` fails on any literal. No keystore,
password or secret is ever committed. Nothing is published: no Play upload from CI.

## Signing setup (Wyndham, on his own computer; not run by any agent)

1. Make the upload key once and keep it, with its passwords, offline (losing it means asking
   Google for an upload-key reset):

   ```bash
   keytool -genkeypair -v -keystore thoth-upload.jks -alias thoth-upload -keyalg RSA -keysize 4096 -validity 10000
   ```

2. In GitHub → elghaly-dev/thoth → Settings → Secrets and variables → Actions, add:
   `THOTH_UPLOAD_KEYSTORE_B64` (output of `base64 -w0 thoth-upload.jks`),
   `THOTH_UPLOAD_STORE_PASSWORD`, `THOTH_UPLOAD_KEY_ALIAS` (`thoth-upload`),
   `THOTH_UPLOAD_KEY_PASSWORD`.
3. Run `signed-release-aab` and download the `thoth-signed-aab` artifact.
4. In Play Console, create the app `dev.elghaly.thoth`, accept **Play App Signing**, and upload
   the AAB to an internal-testing track.

## Digital Asset Links

`.well-known/assetlinks.json` holds the placeholder
`REPLACE_WITH_SHA256_FINGERPRINT_FROM_FIRST_UPLOAD` until step 4 is done. Then:

1. Play Console → Test and release → Setup → App integrity → App signing: copy the
   **App signing key certificate** SHA-256. Apps installed from Play carry that key, so Android
   verifies the TWA against it, not the upload key.
2. `node tools/set-assetlinks.mjs <app-signing SHA-256> [<upload-key SHA-256>]`. The tool
   refuses anything that is not a 32-byte `AA:BB:…` fingerprint. The optional second value
   (printed by `signed-release-aab`) lets sideloaded test builds verify too.
3. `node tools/check-twa.mjs`, then a Draft PR. Once deployed,
   `https://thoth.elghaly.dev/.well-known/assetlinks.json` must serve the file as
   `application/json` with no redirect; otherwise Chrome shows the URL bar inside the app.

## Local build (not run here)

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest twa-manifest.json
cd android && ./gradlew :app:bundleRelease
```
