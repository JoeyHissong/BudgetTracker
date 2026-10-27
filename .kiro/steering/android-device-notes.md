---
inclusion: always
---

# Android local device notes

The connected Android test device (Pixel 9a, currently serial `59211JEBF02409`)
has **both** a release/prod build and the debug build installed side by side:

- `com.joeyhissong.budgettracker` — prod/release build
- `com.joeyhissong.budgettracker.debug` — debug build (the one Metro/dev work targets)

`android/app/build.gradle` applies `applicationIdSuffix ".debug"` to the debug
build type, which is what causes the two distinct package IDs.

## Known issue: `npx react-native run-android` launches the wrong app

The React Native CLI's launch step does not account for `applicationIdSuffix`.
After it builds and installs the debug APK, it issues a launch intent using
the base `applicationId` (no `.debug` suffix) — so it ends up launching the
already-installed **prod** app instead of the debug build it just installed.
The install itself is fine; only the auto-launch targets the wrong package.

Symptom: after running `run-android`, the foreground app doesn't reflect
recent JS changes and isn't connected to the Metro dev server.

Workaround: after `run-android` finishes, explicitly stop the prod app and
launch the debug one:

```bash
adb shell am force-stop com.joeyhissong.budgettracker
adb shell am start -n com.joeyhissong.budgettracker.debug/com.joeyhissong.budgettracker.MainActivity
```

Verify the right app is in the foreground with:

```bash
adb shell dumpsys window | grep -i mCurrentFocus
```

It should report `com.joeyhissong.budgettracker.debug`, not the bare
`com.joeyhissong.budgettracker` package.

Do not uninstall the prod build from this device — the user wants to keep it
installed alongside the debug build.

## Known issue: "unable to load script" on the debug build

This means the debug app can't reach the Metro dev server over USB. It
happens whenever the device's USB connection drops and reconnects (check
`adb devices -l` — a changed `transport_id` vs. a prior session confirms a
reconnect happened), since the `adb reverse` port forward doesn't survive
that.

Check first:

```bash
adb reverse --list
```

If it doesn't show `UsbFfs tcp:8081 tcp:8081` (or is empty), restore it and
relaunch the debug app:

```bash
adb reverse tcp:8081 tcp:8081
adb shell am force-stop com.joeyhissong.budgettracker.debug
adb shell am start -n com.joeyhissong.budgettracker.debug/com.joeyhissong.budgettracker.MainActivity
```
