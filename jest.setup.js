/* eslint-env jest */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// These wrap native modules with no JS-only implementation, so they need
// manual mocks for tests that import code which pulls them in transitively
// (e.g. the settings screen, via the backup/export-import feature).
jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(),
  saveDocuments: jest.fn(),
  isErrorWithCode: jest.fn(() => false),
  errorCodes: { OPERATION_CANCELED: 'OPERATION_CANCELED' },
}));

jest.mock('@dr.pogodin/react-native-fs', () => ({
  TemporaryDirectoryPath: '/tmp/',
  writeFile: jest.fn(),
  readFile: jest.fn(),
  unlink: jest.fn(),
}));

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn(() => Promise.resolve('bill-due-reminders')),
    requestPermission: jest.fn(() => Promise.resolve({ authorizationStatus: 1 })),
    getNotificationSettings: jest.fn(() => Promise.resolve({ android: { alarm: 1 } })),
    openAlarmPermissionSettings: jest.fn(() => Promise.resolve()),
    getTriggerNotificationIds: jest.fn(() => Promise.resolve([])),
    cancelTriggerNotifications: jest.fn(() => Promise.resolve()),
    createTriggerNotification: jest.fn(() => Promise.resolve('id')),
  },
  AndroidImportance: { HIGH: 4 },
  AndroidNotificationSetting: { ENABLED: 1, DISABLED: 2 },
  AuthorizationStatus: { NOT_DETERMINED: -1, DENIED: 0, AUTHORIZED: 1, PROVISIONAL: 2 },
  TriggerType: { TIMESTAMP: 0, INTERVAL: 1 },
}));
