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
