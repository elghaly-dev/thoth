# Thoth — Android TWA

Wrapper for https://thoth.elghaly.dev as a Trusted Web Activity.

- package id: `dev.elghaly.thoth`
- app name: Thoth, launcher name Thoth, language `hi`
- display: standalone, start_url `/`
- targetSdk: set by Bubblewrap from the installed Android SDK (currently 34 via Bubblewrap defaults; `config/repositories.gradle` pins the SDK versions in the generated project)

## Build

CI (`android-twa`) builds an **unsigned AAB only**. Signing reads
`THOTH_UPLOAD_KEYSTORE_B64`, `THOTH_UPLOAD_KEYSTORE_PASSWORD`, `THOTH_UPLOAD_KEY_ALIAS`,
`THOTH_UPLOAD_KEY_PASSWORD` from repository secrets and **skips cleanly when absent**.

No keystore, password or secret is ever committed. Nothing is published — no Play upload,
no signing key in the repo.

## Digital Asset Links

`.well-known/assetlinks.json` carries a placeholder:
`REPLACE_WITH_SHA256_FINGERPRINT_FROM_FIRST_UPLOAD`. After the first upload, replace it with the
SHA-256 of the upload certificate so Android verifies the TWA belongs to this domain.

## Local build (not run here)

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest twa-manifest.json
cd android && ./gradlew :app:bundleRelease
```
