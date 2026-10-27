# Budget Planner

A simple, local-only app for tracking recurring monthly bills. No sign-up, no cloud, no ads — just your bills.

Built with [React Native](https://reactnative.dev) and TypeScript.

## Features

- **Recurring bills** — Add a bill once with a due day and category, and it rolls forward every month automatically.
- **Mark as paid** — Tap a bill to mark it paid for the month and watch your remaining balance update instantly.
- **Monthly summary** — See total due, total paid, and what's left at a glance, broken down by month.
- **Pay schedule tracking** — Track upcoming paydays alongside your bills to see how income lines up with what's due.
- **Bill due reminders** — Turn on local notifications in Settings to get alerted the day each bill is due, with a configurable reminder time. Entirely on-device — no push service involved.
- **Multi-currency** — Choose the currency that matches your budget from the settings panel.
- **Export & import your data** — Download everything as a JSON file from Settings, and restore it later (new device, reinstall, etc.) by importing that same file.
- **Private by design** — Everything is stored locally on-device with AsyncStorage. No account, no server, no tracking.
- **iOS & Android** — One React Native codebase running natively on both platforms.

## Project structure

```
App.tsx                   App entry point
src/
  components/             Reusable UI (bill list items, modals, summary card, etc.)
  constants/              Static data (currency list, etc.)
  contexts/                React context providers (currency, theme, reminders)
  hooks/                   Data/state hooks (bills, pay schedule, timeline, bill reminder scheduling)
  notifications/           Local notification scheduling for bill due reminders (via Notifee)
  screens/                 Top-level screens (Home, Settings)
  storage/                 AsyncStorage-backed persistence (bills, pay schedule, settings, backup export/import)
  utils/                   Pure helpers (date math, currency formatting)
  types.ts                 Shared TypeScript types
docs/                      Marketing/landing page, deployed via GitHub Pages
```

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Install dependencies

```sh
npm install
```

## Step 2: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of the project:

```sh
npm start
```

## Step 3: Build and run the app

With Metro running, open a new terminal window/pane from the root of the project, and use one of the following commands to build and run the app:

### Android

```sh
npm run android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you set up the project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update native dependencies, run:

```sh
bundle exec pod install
```

For more information, see the [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
npm run ios
```

If everything is set up correctly, you should see the app running in the Android Emulator, iOS Simulator, or your connected device. You can also build it directly from Android Studio or Xcode.

## Testing and linting

```sh
npm test     # run the Jest test suite
npm run lint # run ESLint
```

## Backing up your data

Since everything is stored locally with no account or cloud sync, Settings → Data lets you export a JSON snapshot of all your bills, pay schedule, and preferences, and import it back later (e.g. after reinstalling or switching devices). Importing fully replaces the data currently in the app. This feature uses [`@react-native-documents/picker`](https://react-native-documents.github.io/) for the native save/open dialogs and [`@dr.pogodin/react-native-fs`](https://github.com/birdofpreyru/react-native-fs) for reading/writing the file — both are native modules, so after pulling changes that touch them you'll need to reinstall CocoaPods (`bundle exec pod install`) and rebuild the Android app.

## Bill due reminders

Settings → Reminders has a toggle for "Bill due today" notifications, plus a preset to pick what hour they fire (default 9 AM). Reminders are scheduled on-device for every bill a few months ahead using [`@notifee/react-native`](https://notifee.app) — there's no push service or backend involved. On Android 12+, exact-time delivery also depends on the system's "Alarms & reminders" permission; the app walks the user to that settings screen if it isn't granted. Like the backup feature above, Notifee is a native module, so a fresh clone needs `bundle exec pod install` and a rebuild before reminders work on a device.

## Privacy

Budget Planner stores all data locally on your device using AsyncStorage. Nothing is sent to a server, and the app works entirely offline. The export/import feature only writes to a file you explicitly choose to save or open — the app never transmits data anywhere. See [`docs/privacy.html`](docs/privacy.html) for the full privacy policy.

## License

MIT &copy; Joey Hissong. See [`LICENSE`](LICENSE) for details.

## Learn more about React Native

- [React Native Website](https://reactnative.dev)
- [Environment Setup](https://reactnative.dev/docs/environment-setup)
- [Learn the Basics](https://reactnative.dev/docs/getting-started)
- [Fast Refresh](https://reactnative.dev/docs/fast-refresh) — how `App.tsx` changes show up live while developing
- [Troubleshooting](https://reactnative.dev/docs/troubleshooting)
