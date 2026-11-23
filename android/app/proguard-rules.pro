# The launcher activity and file provider are named in the manifest, so R8 keeps them.
# android-browser-helper and androidx ship their own consumer rules; nothing else is
# loaded by reflection in this wrapper.
-keep class com.google.androidbrowserhelper.trusted.** { *; }
