# Budget Planner

A simple, local-only app for tracking recurring monthly bills. No sign-up, no cloud, no ads — just your bills.

Built with [React Native](https://reactnative.dev) and TypeScript.

## Features

- **Recurring bills** — Add a bill once with a due day and category, and it rolls forward every month automatically.
- **Mark as paid** — Tap a bill to mark it paid for the month and watch your remaining balance update instantly.
- **Monthly summary** — See total due, total paid, and what's left at a glance, broken down by month.
- **Pay schedule tracking** — Track upcoming paydays alongside your bills to see how income lines up with what's due.
- **Multi-currency** — Choose the currency that matches your budget from the settings panel.
- **Private by design** — Everything is stored locally on-device with AsyncStorage. No account, no server, no tracking.
- **iOS & Android** — One React Native codebase running natively on both platforms.

## Project structure

```
App.tsx                   App entry point
src/
  components/             Reusable UI (bill list items, modals, summary card, etc.)
  constants/              Static data (currency list, etc.)
  contexts/                React context providers (currency)
  hooks/                   Data/state hooks (bills, pay schedule, timeline)
  screens/                 Top-level screens (Home, Settings)
  storage/                 AsyncStorage-backed persistence (bills, pay schedule, settings)
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

## Privacy

Budget Planner stores all data locally on your device using AsyncStorage. Nothing is sent to a server, and the app works entirely offline. See [`docs/privacy.html`](docs/privacy.html) for the full privacy policy.

## License

MIT &copy; Joey Hissong. See [`LICENSE`](LICENSE) for details.

## Learn more about React Native

- [React Native Website](https://reactnative.dev)
- [Environment Setup](https://reactnative.dev/docs/environment-setup)
- [Learn the Basics](https://reactnative.dev/docs/getting-started)
- [Fast Refresh](https://reactnative.dev/docs/fast-refresh) — how `App.tsx` changes show up live while developing
- [Troubleshooting](https://reactnative.dev/docs/troubleshooting)
