# Thoth — Android TWA

Wrapper for https://thoth.elghaly.dev as a Trusted Web Activity.

- package id: `dev.elghaly.thoth`
- app name: Thoth, launcher name Thoth, language `hi`
- display: standalone, start_url `/use/` (matches `manifest.webmanifest`), theme and background `#0b0c10`
- icons: `/icon-512.png`, maskable `/icon-maskable-512.png`, web manifest `/manifest.webmanifest`
- targetSdk: not stated yet. It is set by the Bubblewrap/Android SDK version used for the build and is recorded here only after a real build proves it.

## Build

There is no Android build in CI yet: this PR adds the Bubblewrap input only. A later release
workflow will read `THOTH_UPLOAD_KEYSTORE_B64`, `THOTH_UPLOAD_STORE_PASSWORD`, `THOTH_UPLOAD_KEY_ALIAS`
and `THOTH_UPLOAD_KEY_PASSWORD` from repository secrets (names only; values never in the repo).

No keystore, password or secret is ever committed. Nothing is published — no Play upload,
no signing key in the repo.

## Digital Asset Links

`.well-known/assetlinks.json` carries a placeholder:
`REPLACE_WITH_SHA256_FINGERPRINT_FROM_FIRST_UPLOAD`. After the first upload, replace it with the
SHA-256 of the **app signing** certificate shown in Play Console (Setup → App integrity → App
signing). Apps installed from Play are signed with that key, not the upload key, so Android can
only verify the TWA against it. The upload key's fingerprint may be added as a second entry for
test builds.

## Local build (not run here)

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest twa-manifest.json
cd android && ./gradlew :app:bundleRelease
```
